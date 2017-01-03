# processTree.py: Maintain a tree of processes and its children and compute aggregate CPU
import os

class Process(object):
    def __init__(self, pid, cpu=0.0):
        self._pid = pid
        self._cpu = cpu
        self._children = set()

    def addChildren(self, process):
        if isinstance(process, list):
            for p in process:
                self._children.add(p)
        else:
            self._children.add(process)

    def getChildren(self):j
        return self._children

    def setCpu(self, cpu):
        self._cpu = cpu

    def aggCpu(self):
        aggregate = self._cpu
        for child in self._children:
            aggregate = aggregate + child.aggCpu()
        return aggregate


def testProcess():
    p = Process(1, 10.4)
    q = Process(1, 27.3)
    r = Process(1, 46.5)
    s = Process(1, 57.4)
    t = Process(1, 71.3)

    q.addChildren([s, t])
    p.addChildren([q, r])

    print("Agg Cpu:%f" % p.aggCpu())

if __name__ == "__main__":
    testProcess()