# Version Lens for Visual Studio Code

[![Badge for version for Visual Studio Code extension](https://vsmarketplacebadge.apphb.com/version-short/pflannery.vscode-versionlens.svg?color=blue&style=?style=for-the-badge&logo=visual-studio-code)](https://marketplace.visualstudio.com/items?itemName=pflannery.vscode-versionlens&wt.mc_id=vscode-versionlens-github-vscode-contrib) [![Installs](https://vsmarketplacebadge.apphb.com/installs-short/pflannery.vscode-versionlens.svg?color=blue&style=flat-square)](https://marketplace.visualstudio.com/items?itemName=pflannery.vscode-versionlens)
[![Rating](https://vsmarketplacebadge.apphb.com/rating-short/pflannery.vscode-versionlens.svg?color=blue&style=flat-square)](https://marketplace.visualstudio.com/items?itemName=pflannery.vscode-versionlens) [![The MIT License](https://img.shields.io/badge/license-MIT-orange.svg?color=blue&style=flat-square)](http://opensource.org/licenses/MIT)

[![](https://img.shields.io/github/workflow/status/vscode-contrib/vscode-versionlens/Visual%20Studio%20Code%20Tests/master.svg?logo=github&label=Visual%20Studio%20Code%20Tests)](https://github.com/vscode-contrib/vscode-versionlens/actions?query=workflow%3A%22Visual+Studio+Code+Tests%22)

This extension shows __version__ information when opening a package or project for one of the following:

- dotnet https://www.dotnetfoundation.org/
- dub https://code.dlang.org/
- jspm https://jspm.io/,
- maven https://maven.apache.org/
- npm https://www.npmjs.com/
- pub https://pub.dev/
- composer https://getcomposer.org/

## How do I see version information?

Click the V icon in the package\project file toolbar.

You can also choose the default startup state by setting `versionlens.suggestions.showOnStartup`

![Show releases](images/gifs/show-releases.gif)

## Can I see prerelease versions?

Yes! click on the tag icon in the package\project file toolbar.

You can also choose the default startup state by setting `versionlens.suggestions.showPrereleasesOnStartup`

![Show prereleases](images/gifs/show-prereleases.gif)

## How do I install this extension?

Follow this link on [how to install vscode extensions](https://code.visualstudio.com/docs/editor/extension-gallery)

## Can I install this extension manually?

Yes goto the [release page for instructions](https://github.com/vscode-contrib/vscode-versionlens/releases)

## I'm not able to install this extention

Try a clean install:

- Shut down vscode
- Delete the extension folder `{home}/.vscode/extensions/pflannery.vscode-versionlens*`
- Open vscode and try reinstalling the extension again

If that fails then have a look in the `Log (Extension Host)` channel. Report it here if that doesn't help.

![image](https://user-images.githubusercontent.com/1727302/83176957-36440000-a116-11ea-8e22-2e71889d7a79.png)

## How do I troubleshoot this extension?

Version lens writes a log to an output channel in vscode.

If your experiencing issues please set your `versionlens.logging.level` to `debug` (vscode needs to be restarted) 

Then open the channel like:

![image](https://user-images.githubusercontent.com/1727302/83174754-bec0a180-a112-11ea-827f-de0f878054fc.png)


## License


Licensed under ISC

Copyright &copy; 2016+ [contributors](https://github.com/vscode-contrib/vscode-versionlens/graphs/contributors)
