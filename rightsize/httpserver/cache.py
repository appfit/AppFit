import json
import os

CACHE_FOLDER = './downloads'
CACHE_FILE_NAME = 'server.cache'
CACHE_PATH_NAME = CACHE_FOLDER + '/' + CACHE_FILE_NAME

class Cache(object):

    def __init__(self):
        if not os.path.exists(CACHE_FOLDER):
            os.mkdir(CACHE_FOLDER)

        with open(CACHE_PATH_NAME, 'a+') as cacheFile:
            try:
                self._cache = json.load(cacheFile)
            except:
                self._cache = {}

    def add_entry(self, imageName, appCommand, testCommand):
        with open(CACHE_PATH_NAME, 'w') as cacheFile:
            self._cache[imageName] = [appCommand, testCommand]
            json.dump(self._cache, cacheFile)

    def exists(self, imageName, appCommand, testCommand):
        if imageName in self._cache and \
                self._cache[imageName] == [appCommand, testCommand]:
            return True
        else:
            return False

    def __getitem__(self, key):
        return self._cache[key]

    def __setitem__(self, key, value):
        with open(CACHE_PATH_NAME, 'w') as cacheFile:
            self._cache[key] = value
            json.dump(self._cache, cacheFile)

    def to_json(self):
        return json.dumps(self, default=lambda o: o.__dict__, sort_keys=True, indent=4)

