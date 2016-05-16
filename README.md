# node-auth-server
 Authorization Server by node

# reffrences
* ref1: [here](https://github.com/scottksmith95/beerlocker)
* ref2: [here](https://github.com/IGZangelsanchez/oauth2orize-example-extended)
* ref3: [here](https://hnryjms.github.io/2014/04/authentication/) [here](https://hnryjms.github.io/2014/07/oauth2/)

# source code
* [github](https://github.com/AkihiroTakamura/node-auth-server)


# Getting Stated

## install mongoDB(mac)

```
# install
brew install mongodb

# mongoDB auto start
ln -sfv /usr/local/opt/mongodb/*.plist ~/Library/LaunchAgents
launchctl load ~/Library/LaunchAgents/homebrew.mxcl.mongodb.plist

```

## install mongoDB(Linux with yum)

* make repository file

```/etc/yum.repos.d/mongodb.repo
[mongodb]
name=MongoDB Repository
baseurl=http://downloads-distro.mongodb.org/repo/redhat/os/x86_64/
gpgcheck=0
enabled=1
```

* install and run

```
sudo yum install -y mongodb-org
sudo chkconfig mongod on
sudo service mongod start

```


## install node(mac)(if not installed)

```
brew install node
npm install -g n
n stable
```

## install node(Linux)(if not installed)

```
yum install nodejs npm --enablerepo=epel
npm install -g n
n stable
```

## install global node modules

```
npm install -g node-inspector gulp nodemon pm2

```


## how to debug application

```
git clone ...
cd node-auth-server
npm install
gulp
```

## how to run application

```
export NODE_ENV=production
pm2 start server.js --name="node-auth-server" --watch

```




# Functions
* User Authentification by id/pass
  * basic authenticate/form authenticate
* Application Authorization by clientid/clientsecret
  * OAuth2.0 grant code flow
* Management page for User/Role/Client and so on.


# Tutorial

## first setting by Management view
* http://localhost:9999/
* Default User
  * username: admin
  * password: admin

> default user is defined config/*.json

![Kobito.lO2E2S.png](https://qiita-image-store.s3.amazonaws.com/0/60056/576b920d-4264-7768-7879-cf443ee82028.png "Kobito.lO2E2S.png")

## regist client

* for regist oauth2 client, select 'Manage Client' from Menu first.

![Kobito.jWpQA6.png](https://qiita-image-store.s3.amazonaws.com/0/60056/ef6d14f5-9fe4-baf0-1421-1a8639dcea42.png "Kobito.jWpQA6.png")

* click add button

![Kobito.BkD1wk.png](https://qiita-image-store.s3.amazonaws.com/0/60056/ac869c5a-5615-3e90-e976-0676b179a5b1.png "Kobito.BkD1wk.png")

* regist client.
  * we suppose set your hostname which  callback after authorization to domain(redirect url)

![Kobito.nyxfJc.png](https://qiita-image-store.s3.amazonaws.com/0/60056/8deeda95-f864-97ef-fb93-3c67efc6c040.png "Kobito.nyxfJc.png")


* after client registed, application secret is shown. please note this for oauth connection.

![Kobito.qYLYnv.png](https://qiita-image-store.s3.amazonaws.com/0/60056/08525f1b-6ac3-28b4-cae3-fb94ed4f1e4b.png "Kobito.qYLYnv.png")


## Get Oauth Code
* After registed client, you can get Access Token by web api.

* first, you have to get oauth2 code.
* open browser and input following url.

```
http://localhost:9999/api/oauth2/authorize?client_id=example&response_type=code&redirect_uri=http://localhost:9999&scope=username role fullName email phone image
```

* authorization page opened, click 'aoorove and continue'

![Kobito.qNCcT3.png](https://qiita-image-store.s3.amazonaws.com/0/60056/bdc894d3-4821-0770-ae50-96f28fba975e.png "Kobito.qNCcT3.png")


* see url bar in your browser.
* url includes oauth code like http://localhost:9999/code=mf7IOpFpY8kb6g5B
* note the code


## Exchange Oauth code to accessToken

* please open postman.

* url: /api/oauth2/token
* method: POST
* header:
  * Authorization: Basic [converted base64 string 'clientid:client secret']
* body
  * code: mf7IOpFpY8kb6g5B

  > set OAuthCode - you noted a little while ago

  * grant_type: authorization_code

![Kobito.nnD6w0.png](https://qiita-image-store.s3.amazonaws.com/0/60056/86a9cd86-d3f2-9b7e-ab95-1e7c334b2fbe.png "Kobito.nnD6w0.png")


![Kobito.Ec05Hd.png](https://qiita-image-store.s3.amazonaws.com/0/60056/0888ff29-08bc-678a-0b13-9902a7fcd023.png "Kobito.Ec05Hd.png")


* if ok, return access token by json

![Kobito.FnvIZH.png](https://qiita-image-store.s3.amazonaws.com/0/60056/df70a5bc-7022-4e2b-fc62-e1f7026a69aa.png "Kobito.FnvIZH.png")



> please note that, OAuth Code is One-Time useage.
> if you try again, go back browser and re get Oauth code.


## Get Profile Information by accessToken
* url: /api/profile
* method: GET
* header
  * Authorization: Bearer <accesstoken>

![Kobito.EHf6NK.png](https://qiita-image-store.s3.amazonaws.com/0/60056/8eb21a5f-8b95-23ee-afb4-1549a534feeb.png "Kobito.EHf6NK.png")


# Grant Types
## authorization_code
* see Tutorial


## Resource Owner Password Credentials
> Exchange username/password to AccessToken

* url: /api/oauth2/token
* method: POST
* header
  * Authorization: Basic clientid:clientsecret
* body
  * grant_type: password
  * username: user id
  * password: user password
  * scope: scopes


![Kobito.pZ7Mjj.png](https://qiita-image-store.s3.amazonaws.com/0/60056/83754b14-42ab-4a90-b7cc-301d24259078.png "Kobito.pZ7Mjj.png")

![Kobito.M1l2ge.png](https://qiita-image-store.s3.amazonaws.com/0/60056/0c11acb4-c4d6-a932-96b8-7a1b9def7d4d.png "Kobito.M1l2ge.png")

## Client Credentials
> Exchange client_id/client_secret to AccessToken

* url: /api/oauth2/token
* method: POST
* header
  * Authorization: Basic clientid:clientsecret
* body
  * grant_type: client_credentials
  * scope: username,role,fullName,email,phone


## refresh token
* url: /api/oauth2/token
* method: POST
* header
  * Authorization: Basic clientid:clientsecret
* body
  * grant_type: refresh_token
  * refresh_token: refresh token

![Kobito.ydlc18.png](https://qiita-image-store.s3.amazonaws.com/0/60056/015ee593-74f4-1f0c-28ee-b7f967abd23a.png "Kobito.ydlc18.png")


# APIs

## add user
* url: /api/users
* method: POST
* header
  * Authorization: Bearer <accesstoken>
* body
  * username: user id
  * password: user password
  * fullName: user full name
  * roles: user roles(Array)

## add client
* url: /api/clients
* method: POST
* header
  * Authorization: Bearer <accesstoken>
* body
  * name: client(application) name
  * id: client(application) id
  * domain: client(application) domain e.g)hostname

