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
* id/pass等によるユーザ認証
  * basic認証/form認証
* clientid/clientsecretによるアプリケーション認証
  * OAuth2.0 grant code flowを利用
* 要認証APIからprofile情報の提供

# APIs

## add user
* url: /api/users
* method: POST
* header
  * none
* body
  * username: ユーザid
  * password: ユーザパスワード


![Kobito.R660VF.png](https://qiita-image-store.s3.amazonaws.com/0/60056/ffca25c6-56e7-aa38-f983-fc19e7f5a0a0.png "Kobito.R660VF.png")

## add client
* url: /api/clients
* method: POST
* header
  * Authorization: Basic userid:password
* body
  * name: client(application) name
  * id: client(application) id
  * secret: client(application) password
  * domain: client(application) domain e.g)hostname

![Kobito.DbRnho.png](https://qiita-image-store.s3.amazonaws.com/0/60056/472bd078-19e7-7d97-2b26-e2308d5c07dc.png "Kobito.DbRnho.png")

![Kobito.r5qlJD.png](https://qiita-image-store.s3.amazonaws.com/0/60056/71d60236-a411-e551-c6d0-f120d7f5b19f.png "Kobito.r5qlJD.png")


## get OAuth code
* ブラウザより
  * http://localhost:8080/api/oauth2/authorize?client_id=clientid&response_type=code&redirect_uri=http://localhost:8080&scope=read write

* 登録したuserid/passwordを入力、redirectされるcodeをメモ

## get Access Token and Refresh Token
* url: /api/oauth2/token
* method: POST
* header
  * Authorization: Basic clientid:clientsecret
* body
  * code: 取得したOAuth code
  * grant_type: authorization_code
  * redirect_uri: client登録時に指定したredirect_uri

![Kobito.P3f8Fz.png](https://qiita-image-store.s3.amazonaws.com/0/60056/22f03cf3-bb4b-238a-de65-56937508b9c3.png "Kobito.P3f8Fz.png")

![Kobito.vzYo7K.png](https://qiita-image-store.s3.amazonaws.com/0/60056/3530d64a-4fdf-b0ba-fb1c-1e1c8d409f81.png "Kobito.vzYo7K.png")


## execute secure api
* url: /api/users/
* method: POST
* header
  * Authorization: Bearer 取得したaccesstoken

![Kobito.nyeua4.png](https://qiita-image-store.s3.amazonaws.com/0/60056/42f9bf52-316f-4452-8ba1-afed5b2b5a1c.png "Kobito.nyeua4.png")

# refresh token
* url: /api/oauth2/token
* method: POST
* header
  * Authorization: Basic clientid:clientsecret
* body
  * grant_type: refresh_token
  * refresh_token: accessTokenと一緒に取得したrefreshToken

![Kobito.ydlc18.png](https://qiita-image-store.s3.amazonaws.com/0/60056/015ee593-74f4-1f0c-28ee-b7f967abd23a.png "Kobito.ydlc18.png")


# TODO
* ~~redirect_uriのvalidation~~
* ~~clientsecretのencrypt~~
* ~~deny押した時の挙動~~
* ~~accessTokenの有効期限とrefreshToken~~
* userのログアウト
* userの権限(admin権限は全ユーザ・クライアント見れる)
* user認証の共有api
* user認可ありのアプリ一覧、認可の解除機能
* 通常ログイン時のprofile等、メニュー画面


