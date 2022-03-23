# ELectron Valpec

### Copiando para pasta /build

Utilizando o pacote `cpy` [link](https://www.npmjs.com/package/cpy) para copiar os
arquivos e pasta do src para o build. O build empacota os arquivos para o instalador
compactar tudo.

- No arquivo `package.json` eu defino o "main":"./build/main.js".

O scripts para copiar `beforePackCopy.js`:

```js
import cpy from 'cpy';
(async function(){
  await cpy([
    // 'src', // clone dir
    'src/**/*', // Copy all
    '!main.js', // Ignore 
    '!preload.js', // Ignore 
  ], 'build');  
  // Copy node_modules to destination/node_modules
  // await cpy('src', 'build');
})()
```
Adicionando nos scripts `package.json`:

```json
"scripts": {
  "copy:files:to:build": "node .\beforePackCopy.js"
}
```

### Encrypt main.js & preload.js

Para encriptografar os principais arquivos do electron.js, ou melhor para embaralhar,
utilizo o `build-electron` [link](https://www.npmjs.com/package/build-electron).

Configuração do arquivo `build-electron.config.js`:
- Copia o /src/main.js
- Copia o /src/preload.js
- Envia para /build

```js
module.exports = {
  mainEntry: 'src/main.js',
  preloadEntry: 'src/preload.js',
  outDir: 'build',
  mainTarget: 'electron16.0-main',
  preloadTarget: 'electron16.0-preload',
}
```

Adicionando nos scripts `package.json`:

```json
"scripts": {
  "build:encrypt:data": "copy:files:to:build && build-electron"
}
```

### Gerando instalador com electron-builds

Utilizando o pacote `electron-builder` [link](https://www.npmjs.com/package/electron-builder) [websote](https://www.electron.build/).

- **Build**
- electron-builder build 
- **Pega as configurações do yml**
- --config=electron-builder.yml 
- **Publica no repositório**
- --publish never 
- **Define a plataforma**
- --win --ia32 | --win --x64 | --linux

Adicionando nos scripts `package.json`:

```json
"scripts": {
    "build:win32": "npm run build:encrypt:data && electron-builder build --config=electron-builder.yml --publish never --win --ia32 && npm run build:rename",
    "build:win": "npm run build:encrypt:data && electron-builder build --config=electron-builder.yml --publish never --win --x64 && npm run build:rename",
    "build:linux": "npm run build:encrypt:data && electron-builder build --config=electron-builder.yml --publish never --linux && npm run build:rename",
    "build:all": "npm run build:encrypt:data && electron-builder build --config=electron-builder.yml --publish never --win --linux --mac && npm run build:rename",
    "build:win32:publish": "npm run build:encrypt:data && electron-builder build --config=electron-builder.yml --publish always --win --ia32 && npm run build:rename",
    "build:win:publish": "npm run build:encrypt:data && electron-builder build --config=electron-builder.yml --publish always --win --x64 && npm run build:rename",
    "build:linux:publish": "npm run build:encrypt:data && electron-builder build --config=electron-builder.yml --publish always --linux && npm run build:rename",
    "build:all:publish": "npm run build:encrypt:data && electron-builder build --config=electron-builder.yml --publish always --win --linux --mac && npm run build:rename"
}
```

`electron-builder.yml`

```yml
# name: valpec-catalog-app
# productName: Electron Updater App
appId: com.gnnc.valpec-catalog-app

asar: true
extends: null
compression: maximum
productName: "Valpec Catálogo"
copyright: "Copyright © 2022 ${author}"
afterPack: "./afterPackHook.js"

publish:
  provider: github
  owner: gnnc
  repo: valpec-catalog-app
  token: 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
  vPrefixedTagName: true
```
=======
# valpec-catalog-app
Catálogo VALPEC
