- 0.10.0
  - Added github commitish support for npm, jspm and bower. Doesn't support pre-releases yet.

    ![npm-comittish](https://cloud.githubusercontent.com/assets/1727302/20376535/69a638a8-ac7f-11e6-8408-857759c21106.gif)

    Also supports semver releases\tags 

    ![npm-comittish2](https://cloud.githubusercontent.com/assets/1727302/20376610/1669b59c-ac80-11e6-9415-94ed83066f0b.gif)

- 0.9.1
  - Fixes invalid message when using tags i.e. @next

- 0.9.0
  - Github and local file system packages are now treated as clickable links that browse to their respective destinations. (git urls are not implemented yet)

- 0.8.0
  - Added support for npm private packages and private registries

- 0.7.1
  - Replaces update arrow indicator to be a unicode charachter due to change in vscode 1.7. See https://github.com/Microsoft/vscode/issues/13714 for more info.

- 0.7.0
  - Adds support for preserving some semver operators when updating

- 0.6.0
  - Added jspm package support

- 0.5.0
  - Added npm scoped packages support

- 0.4.3
  - Fixes versionlens for dub sub packages

- 0.4.2
  - Transferred this project over to https://github.com/vscode-contrib/vscode-versionlens

- 0.4.1
  - Replaces internal json module with external
  - Replaces internal request module with external

- 0.4.0
  - Adds dotnet project.json support
  - Fixes issue when a child version entry is not present

- 0.3.0
  - Adds dub dub.json support