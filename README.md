# node-auth-server
 Authorization Server by node

# reffrences
* ref1: [here](https://github.com/scottksmith95/beerlocker)
* ref2: [here](https://github.com/IGZangelsanchez/oauth2orize-example-extended)
* ref3: [here](https://hnryjms.github.io/2014/04/authentication/) [here](https://hnryjms.github.io/2014/07/oauth2/)

# source code
* [github](https://github.com/AkihiroTakamura/node-auth-server)


# Getting Stated

## install mongoDB

```
# install
$ brew install mongodb

# mongoDB auto start
$ ln -sfv /usr/local/opt/mongodb/*.plist ~/Library/LaunchAgents
$ launchctl load ~/Library/LaunchAgents/homebrew.mxcl.mongodb.plist

```

## install global node modules

```
$ npm install -g node-inspector gulp nodemon

```


## how to start application

```
$ git clone ...
$ cd node-auth-server
$ npm install
$ gulp
```


# Functions
* User Authentification by id/pass
  * basic authenticate/form authenticate
* Application Authorization by clientid/clientsecret
  * OAuth2.0 grant code flow
* Management page for User/Role/Client


# Tutorial

## first setting by Management view
* http://localhost:8080/
* Default User
  * username: admin
  * password: admin

> default user is defined config/*.json

![Kobito.G0NnGF.png](https://qiita-image-store.s3.amazonaws.com/0/60056/9c4ab2d1-3214-c746-c069-59d0460a7da9.png "Kobito.G0NnGF.png")

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
http://localhost:8080/api/oauth2/authorize?client_id=example&response_type=code&redirect_uri=http://localhost:8080&scope=admin
```

* authorization page opened, click 'aoorove and continue'

![Kobito.IWYdUv.png](https://qiita-image-store.s3.amazonaws.com/0/60056/72901875-e52f-37a4-33ff-4162b6412593.png "Kobito.IWYdUv.png")

* see url bar in your browser.
* url includes oauth code like http://localhost:8080/code=mf7IOpFpY8kb6g5B
* note the code


## Exchange code for accessToken

* please open postman.

* url: /api/oauth2/token
* method: POST
* header
  * Authorization: Basic
    * username: example
    * password:CTyIEQXhe3TEAOwhUlAyxZd4f1ZFB3jm

> you have to set clientid and client secret

* body
  * code: mf7IOpFpY8kb6g5B


  > set OAuthCode - you noted a little while ago

  * grant_type: authorization_code
  * redirect_uri: localhost

![Kobito.zfPcd9.png](https://qiita-image-store.s3.amazonaws.com/0/60056/695bfbc3-94b9-931e-b221-442681cec8bc.png "Kobito.zfPcd9.png")

![Kobito.2jlufH.png](https://qiita-image-store.s3.amazonaws.com/0/60056/d1a5ca94-db4f-74f8-2ec1-f7a31f578327.png "Kobito.2jlufH.png")

* if ok, return access token by json

![Kobito.x8Ivht.png](https://qiita-image-store.s3.amazonaws.com/0/60056/fddd7ea4-58f7-a08d-43e3-ee247adb8c6c.png "Kobito.x8Ivht.png")



> please note that, OAuth Code is One-Time useage.
> if you try again, go back browser and re get Oauth code.


## Get Profile Information by accessToken
* url: /api/users/
* method: GET
* header
  * Authorization: Bearer <accesstoken>

![Kobito.QTfaQm.png](https://qiita-image-store.s3.amazonaws.com/0/60056/68546dbd-abd6-a4a0-8e61-860fd67307b5.png "Kobito.QTfaQm.png")





# APIs

## add user
* url: /api/users
* method: POST
* header
  * Authorization: Bearer <accesstoken>
* body
  * username: user id
  * password: user password
  * roles: user roles(Array)

## add client
* url: /api/clients
* method: POST
* header
  * Authorization: Bearer <accesstoken>
* body
  * name: client(application) name
  * id: client(application) id
  * secret: client(application) password
  * domain: client(application) domain e.g)hostname

# refresh token
* url: /api/oauth2/token
* method: POST
* header
  * Authorization: Basic clientid:clientsecret
* body
  * grant_type: refresh_token
  * refresh_token: refresh token

![Kobito.ydlc18.png](https://qiita-image-store.s3.amazonaws.com/0/60056/015ee593-74f4-1f0c-28ee-b7f967abd23a.png "Kobito.ydlc18.png")


# TODO
* ~~redirect_uriのvalidation~~
* ~~clientsecretのencrypt~~
* ~~deny押した時の挙動~~
* ~~accessTokenの有効期限とrefreshToken~~
* ~~userのログアウト~~
* ~~userの権限(admin権限は全ユーザ・クライアント見れる)~~
* user認証の共有api
* ~~user認可ありのアプリ一覧、認可の解除機能~~
* 通常ログイン時のprofile等、メニュー画面
* accesstoken状態、session状態等

