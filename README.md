## apidoc-request

apidoc-request is a tool for replacing the apidoc default template. It depends on [apidoc](https://github.com/apidoc/apidoc).

## Usage

```console
$ npm install apidoc -g
$ npm install apidoc-request -g
$ apidoc -i app/controllers/ -o public/doc/
$ cd public/doc/
$ apidoc-request
```

The template generated by `apidoc-request` depends on the api_data.json generated by apidoc. So you must first execute the `apidoc` to generate the template directory.

