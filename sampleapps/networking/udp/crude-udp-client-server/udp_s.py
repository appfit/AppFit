#!/usr/bin/env python
import socket
import sys
import thread

def server():
	port = 12345

	sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
	server = ('', port)
	print >>sys.stderr, 'starting udp server on %s, port %s' % server, port
	sock.bind(server)
	while True:
	    print >>sys.stderr, '\nwaiting to receive message'
	    data, address = sock.recvfrom(4096)

	    print >>sys.stderr, 'received %s bytes from %s' % (len(data), address)
	    print >>sys.stderr, data

	    if data:
	    	thread.start_new_thread(sendThread, (sock, data, address, ))

def sendThread(sock, data, address):
    sent = sock.sendto(data, address)
    print >>sys.stderr, 'Thread-id %s: sent %s bytes back to %s' % (thread.get_ident(), sent, address)

if __name__ == "__main__":
	server()