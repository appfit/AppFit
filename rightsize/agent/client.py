# Client.py - sends an application to launch along with its test program to the agent
# over redis message queue
# Usage: python Client.py App.py Test.py
import sys
import redis

print 'Running Client'
r = redis.Redis(host="redis")
msg = {'Application': sys.argv[1],
       'Test': ' '.join([i for i in sys.argv[2:]])}
r.rpush('queue', str(msg))
