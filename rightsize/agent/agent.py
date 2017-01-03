# Agent.py - Use a message queue interface to launch a program and monitor it
# 
import os
import signal
import time
import subprocess
from subprocess import Popen as Popen
import yaml
import redis
import magic
import psutil
import json

import plotly
print plotly.__version__  # version >1.9.4 required
from plotly.graph_objs import Layout, Bar, Scatter

def main():
    print('Running agent')

    r = redis.Redis(host="redis")
    msg = r.blpop('queue')
    msgdict = eval(msg[1])
    ProcessMessage(msgdict)

def ComputePerformanceReport(snapshots, firstSnapshot, currentSnapshot, cpuCores):
    # Compute means and print the results
    meanMemory = float(sum(x['memory'] for x in snapshots)/len(snapshots))
    meanCpu    = float(sum(x['cpu'] for x in snapshots)/len(snapshots))
    meanFiles  = float(sum(x['files'] for x in snapshots)/len(snapshots))
    lastSnapshot  = snapshots[currentSnapshot % len(snapshots)]

    udpPacketSent = int(lastSnapshot['udp-packets-sent']) - int(firstSnapshot['udp-packets-sent'])
    udpPacketRcvd = int(lastSnapshot['udp-packets-rcvd']) - int(firstSnapshot['udp-packets-rcvd'])
    tcpPacketSent = int(lastSnapshot['tcp-packets-sent']) - int(firstSnapshot['tcp-packets-sent'])
    tcpPacketRcvd = int(lastSnapshot['tcp-packets-rcvd']) - int(firstSnapshot['tcp-packets-rcvd'])

    print('\n\n\n******************   APPLICATION PERFORMANCE REPORT  ******************\n\n')
    print('Memory Usage: %f%%                    CPU Usage: %f%%                   Open Files: %d\n\n' % (meanMemory, meanCpu, meanFiles))
    print('Total UDP Packets Sent: %d               Total TCP Packets Sent: %d' % (udpPacketSent, tcpPacketSent))
    print('Total UDP Packets Rcvd: %d               Total TCP Packets Rcvd: %d\n\n' % (udpPacketRcvd, tcpPacketRcvd))

    jsonData = {
        'cpuData': { 'x': [i for i in range(0, len(snapshots))],
                     'y': [j['cpu'] for j in snapshots] },
        'meanCpu': meanCpu,
        'cpuCores': cpuCores,
        'memoryData': { 'x': [i for i in range(0, len(snapshots))],
                        'y': [j['memory'] for j in snapshots] },
        'meanMemory': meanMemory,
        'udpPacketsSent': { 'x': [i for i in range(0, len(snapshots))],
                        'y': [j['udp-packets-sent'] for j in snapshots] },
        'udpPacketsRcvd': { 'x': [i for i in range(0, len(snapshots))],
                        'y': [j['udp-packets-rcvd'] for j in snapshots] },
        'tcpPacketsSent': { 'x': [i for i in range(0, len(snapshots))],
                        'y': [j['tcp-packets-sent'] for j in snapshots] },
        'tcpPacketsRcvd': { 'x': [i for i in range(0, len(snapshots))],
                        'y': [j['tcp-packets-rcvd'] for j in snapshots] },
    }

    with open('./temp-plot.html', 'w') as htmlFile:
        # htmlFile.write(divCpu)
        json.dump(jsonData, htmlFile)

def ProcessMessage(msgdict):
    # Determine file types of application and test code
    APPPREFIX = []
    TESTPREFIX = []
    PYTHONPATH = [subprocess.check_output(['which', 'python']).rstrip()]
    if msgdict['Application'] and magic.from_file(msgdict['Application'].split()[0]) == 'Python script, ASCII text executable':
        APPPREFIX = PYTHONPATH
    if msgdict['Test'] and magic.from_file(msgdict['Test'].split()[0]) == 'Python script, ASCII text executable':
        TESTPREFIX = PYTHONPATH

    if msgdict['Application'] is None:
        return

    appLogFile = open('app.log', 'w')
    testLogFile = open('test.log', 'w')

    Application = Popen(APPPREFIX + msgdict['Application'].split(), stdout=appLogFile, stderr=subprocess.STDOUT)
    print('Application Command: %s pid %d' % (msgdict['Application'], Application.pid))

    if msgdict['Test']:
        Test = Popen(TESTPREFIX + msgdict['Test'].split(), stdout=testLogFile, stderr=subprocess.STDOUT)
        print('Test Command: %s pid %d' % (msgdict['Test'], Test.pid))
    else:
        print('No test command specified!')

    # We keep track of process performance snapshots in the following dictionary:
    # 
    # { 
    #   'pid1' : [{'cpu': 37.4, 'memory': 102M, 'files': 5}, ...],
    #   'pid2' : [{'cpu': 37.4, 'memory': 102M, 'files': 5}, ...]
    # }
    snapshots = {}        
    snapshots[Application.pid] = []

    currentSnapshot = 0
    stream = file('./agent.yaml', 'r')
    config = yaml.load(stream)
    snapshotSize = config['snapshotSize']
    maxSnapshots = config['maxSnapshots']
    UdpPacketsSentCmd = "netstat --statistics | grep -A 4 Udp: | grep 'packets sent' | awk '{print $1}'"
    UdpPacketsRcvdCmd = "netstat --statistics | grep -A 4 Udp: | grep 'packets received' | awk '{print $1}'"
    TcpPacketsSentCmd = "netstat --statistics | grep -A 10 Tcp: | grep 'segments send' | awk '{print $1}'"
    TcpPacketsRcvdCmd = "netstat --statistics | grep -A 10 Tcp: | grep 'segments received' | grep -v 'bad' | awk '{print $1}'"
    firstSnapshot = None
    
    app_process = psutil.Process(Application.pid)

    for i in range(0,maxSnapshots):
        total_cpu_percent = 0.0
        for child in app_process.children(recursive=True):
            try:
                total_cpu_percent = total_cpu_percent + child.cpu_percent(interval=0.05)
            except:
                continue
        sndict = { 'cpu': total_cpu_percent/len(app_process.cpu_affinity()),
                   'system-cpu': psutil.cpu_percent(interval=0.05),
                   'memory': app_process.memory_info().rss,
                   'system-memory': psutil.virtual_memory().available,
                   'files': len(os.listdir('/proc/%d' % Application.pid)),
                   'udp-packets-sent': subprocess.check_output(UdpPacketsSentCmd, shell=True).rstrip(),
                   'udp-packets-rcvd': subprocess.check_output(UdpPacketsRcvdCmd, shell=True).rstrip(),
                   'tcp-packets-sent': subprocess.check_output(TcpPacketsSentCmd, shell=True).rstrip(),
                   'tcp-packets-rcvd': subprocess.check_output(TcpPacketsRcvdCmd, shell=True).rstrip() }
        currentSnapshot += 1
        if currentSnapshot <= snapshotSize:
            snapshots[Application.pid].append(sndict)
        else:
            snapshots[Application.pid][currentSnapshot % snapshotSize] = sndict
        if not firstSnapshot:
            firstSnapshot = sndict
        time.sleep( 50.0 / 1000.0 )

    os.kill(Application.pid, signal.SIGKILL)
    if msgdict['Test']:
        os.kill(Test.pid, signal.SIGKILL)

    ComputePerformanceReport(snapshots[Application.pid], firstSnapshot, currentSnapshot, len(app_process.cpu_affinity()))

    os.system('tail -10 ./app.log')
    os.system('tail -4 ./test.log')

    os.remove('./app.log')
    os.remove('./test.log')

if __name__ == "__main__":
    main()