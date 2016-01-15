# node-auth-server
* Authorization Server by node
* ref: [here](https://github.com/scottksmith95/beerlocker)

# Getting Stated

## mongoDB

```
# install
$ brew install mongodb

# mongoDB auto start
$ ln -sfv /usr/local/opt/mongodb/*.plist ~/Library/LaunchAgents
$ launchctl load ~/Library/LaunchAgents/homebrew.mxcl.mongodb.plist

```

## application

```
$ git clone ...
$ cd node-auth-server
$ npm install
$ npm start
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

![Kobito.DbRnho.png](https://qiita-image-store.s3.amazonaws.com/0/60056/472bd078-19e7-7d97-2b26-e2308d5c07dc.png "Kobito.DbRnho.png")

![Kobito.pwN24N.png](https://qiita-image-store.s3.amazonaws.com/0/60056/db6b7b2d-3cc4-4fc8-336b-cd2eeb088c8c.png "Kobito.pwN24N.png")


## get OAuth code
* ブラウザより
  * http://localhost:8080/api/oauth2/authorize?client_id=clientid&response_type=code&redirect_uri=http://localhost:8080

* allowをクリックしてredirectされるcodeをメモ

## get Access Token
* url: /api/oauth2/token
* method: POST
* header
  * Authorization: Basic clientid:clientsecret
* body
  * code: 取得したOAuth code
  * grant_type: authorization_code
  * redirect_uri: client登録時に指定したredirect_uri

![Kobito.P3f8Fz.png](https://qiita-image-store.s3.amazonaws.com/0/60056/22f03cf3-bb4b-238a-de65-56937508b9c3.png "Kobito.P3f8Fz.png")

## execute secure api
* url: /api/users/
* method: POST
* header
  * Authorization: Bearer 取得したaccesstoken

![Kobito.nyeua4.png](https://qiita-image-store.s3.amazonaws.com/0/60056/42f9bf52-316f-4452-8ba1-afed5b2b5a1c.png "Kobito.nyeua4.png")



# Demo
* userid/passwordの登録
* OAuth clientの登録
* userid/passwordでユーザ認証
* clientid/clientsecretでアプリケーション認証
  * scopeの認可画面を経由
* redirect_uriで指定したURLにcodeを返却
* codeをPOSTしてaccessTokenを取得
* accessTokenをBearerに指定して認証済みサイトにアクセス
  * accessTokenよりuseridの判別可能


userid: testuser
password: password
clientid: clientid
clientsecret: clientsecret
redirect_uri: xxxxx

http://localhost:8080/api/oauth2/authorize?client_id=clientid&response_type=code&redirect_uri=http://localhost:8080

userid/passを入力

Allowを押下

codeを取得

postmanより
Basic Auth:
  Username: clientid
  Password: clientsecret
Body:
  code: 取得したcode
  grant_type: authorization_code
  redirect_uri: 登録したredirect_uri



# TODO
* userの権限(admin権限は全ユーザ・クライアント見れる）
* ~~redirect_uriのvalidation~~
* ~~clientsecretのencrypt~~
* ~~deny押した時の挙動~~
* accessTokenの有効期限とrefreshToken
