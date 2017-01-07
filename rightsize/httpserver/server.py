# This file provided by Facebook is for non-commercial testing and evaluation
# purposes only. Facebook reserves all rights not expressly granted.
#
# THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
# IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
# FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL
# FACEBOOK BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN
# ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
# WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

import json
import os
import subprocess
import re
import time
from flask import Flask, Response, request, redirect, url_for
from werkzeug.utils import secure_filename
from cache import Cache as Cache

UPLOAD_FOLDER = './downloads'
PACKAGE_PATH = UPLOAD_FOLDER + '/package'
DOCKERBUILD_PACKAGE_PATH = 'Downloads/package'
ALLOWED_EXTENSIONS = set(['py', 'bz2', 'gz', 'egg', 'xz', 'zip'])
TARFILE_EXTENSIONS = set(['.xz', '.gz', '.tar'])

app = Flask(__name__, static_url_path='', static_folder='public')
app.add_url_rule('/', 'root', lambda: app.send_static_file('index.html'))
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

@app.route('/api/analytics', methods=['GET', 'POST'])
def comments_handler():
    response_data = []

    if request.method == 'POST':
        appData = request.form.to_dict()
        os.chdir('../agent')
        command = ['./LaunchAgent.sh', '-p%s' % DOCKERBUILD_PACKAGE_PATH,
                                       '-a%s' % appData['appCommand'],
                                       '-m%s' % appData['appPackage']]
        if appData['testCommand']:
            command.append('-t%s' % appData['testCommand'])

        cache = Cache()
        if appData['useCache'] == 'true':
            if cache.exists(appData['appPackage'], appData['appCommand'], appData['testCommand']):
                command.append("-c")
        cache.add_entry(appData['appPackage'], appData['appCommand'], appData['testCommand'])

        if appData['debugMode'] == 'true':
            command.append("-s")

        if subprocess.call(command, True) == 0:
            for file in sorted(os.listdir('.')):
                m = re.match('temp-plot\.(\d)+\.html', file)
                if m:
                    with open(file, 'r') as htmlFile:
                        response_data.append(htmlFile.read())
                    os.remove(file)

    return Response(
        json.dumps(response_data),
        mimetype='application/json',
        headers={
            'Cache-Control': 'no-cache',
            'Access-Control-Allow-Origin': '*'
        }
    )

@app.route('/api/fetchcache', methods=['GET'])
def fetch_cache_handler():
    response_data = {}

    if request.method == 'GET':
        response_data = Cache().to_json()
        return Response(
            response_data,
            mimetype='application/json',
            headers={
                'Cache-Control': 'no-cache',
                'Access-Control-Allow-Origin': '*'
            }
        )

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1] in ALLOWED_EXTENSIONS

@app.route('/upload', methods=['POST'])
def file_upload_handler():
    if request.method == 'POST':
        # check if the post request has the file part
        if 'fileToUpload' not in request.files:
            print('No file part')
            return 'No file part'
        file = request.files['fileToUpload']
        # if user does not select file, browser also
        # submit a empty part without filename
        if file.filename == '':
            print('No selected file')
            return 'No selected file'
        if file and allowed_file(file.filename):
            if not os.path.exists(UPLOAD_FOLDER):
                os.mkdir(UPLOAD_FOLDER)
            filename = secure_filename(file.filename)
            fullPath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
            file.save(fullPath)
            basename, ext = os.path.splitext(filename)
            if not os.path.exists(PACKAGE_PATH):
                os.mkdir(PACKAGE_PATH)
            if ext in TARFILE_EXTENSIONS:
                untarCmd = "tar xf %s -C %s" % (fullPath, PACKAGE_PATH)
                print('Running tar command %s' % untarCmd)
                subprocess.check_output(untarCmd, shell=True)
            print('Finished untar')
            return 'File uploaded successfully'
    return


if __name__ == '__main__':
    app.run(port=int(os.environ.get("PORT", 3000)))
