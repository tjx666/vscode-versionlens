# 0.17.2
  - Dub correctly identifies packages that are not found. Thanks to @WebFreak001
  - Dub install status decorations are now showing correctly. Thanks again to @WebFreak001

# 0.17.1
  - Fixed issue where tagged versions shown were older than the required version entered. (NPM and DotNet)

    Old horror before this fix

    ![image](https://cloud.githubusercontent.com/assets/1727302/26019089/cff76926-376a-11e7-8a70-824861117332.png)

    Now shows as

    ![image](https://cloud.githubusercontent.com/assets/1727302/26018962/1c10c970-376a-11e7-859a-ef409dab4bc5.png)

  - Some packages in NPM have multiple tags with the same version as what 'latest' provides. When this is the case these tags are not shown.

  - Fixed edge case where many tagged versions caused install decorations to appear on wrong line

# 0.17.0
  - Added tagged version support to dotnet projects (i.e. 1.2.3-beta.1, 1.2.3-rc.1)

    ![image](https://cloud.githubusercontent.com/assets/1727302/25976984/20b32294-36b0-11e7-83b8-ede7f05c1f14.png)

    To filter out packages that have many unwanted tagged versions you can set a preferred list using `versionlens.dotnet.tagFilter` 
  - Latest version will show by default instead of being hidden behind the tagged versions option
  
    ![image](https://cloud.githubusercontent.com/assets/1727302/25977208/d4d51812-36b1-11e7-8e5d-884c09daabe9.png)

  - Fixed non-existing version detection

# 0.16.2
  - Fixes issue where dependency decorations were being stuck on the wrong line after a mutli line edit.
  - Made dependency colours configurable in user settings. Will help if the default colours are difficult to see for a specific theme (CSS colours are valid entries)
    - `versionlens.missingDependencyColour: Default 'red'`
    - `versionlens.outdatedDependencyColour: Default 'orange'`
    - `versionlens.installedDependencyColour: Default 'green'`

# 0.16.1
  - Fixes a bug where dependency decorations could leak in to wrong documents

# 0.16.0
  - Added outdated information for npm

    ![image](https://cloud.githubusercontent.com/assets/1727302/25782781/c6352e30-3348-11e7-8cbe-f056140cce8a.png)

  - Added 'latest' to the dist tags for npm and jspm. This gives the ability to always see the latest version regardless of what version is matched in the package.

    ![image](https://cloud.githubusercontent.com/assets/1727302/25782884/46d11af8-334a-11e7-9a6d-b47e6f0f5f7d.png)

  - Fixes an edge case where npm view doesn't return the list of versions in chronological order. The only edge case found so far is when "x" is sepcified as the version

  - Added fsharp project extensions for dotnet core

    ![image](https://cloud.githubusercontent.com/assets/1727302/25782857/eafb2d9a-3349-11e7-981a-5447bed61210.png)

  - Stopped editor toolbar icons showing in diff mode

# 0.15.0
  - Added two new icon tools to the the editor toolbar

    ![image](https://cloud.githubusercontent.com/assets/1727302/25782819/75ec2f86-3349-11e7-8e38-a4e3d5b7c2d7.png)

    - You can show or hide versions. 
      `versionlens.showVersionLensesAtStartup` defaults to `true`
    - You can show or hide tagged versions.
      `versionlens.showTaggedVersionsAtStartup` defaults to `false`
    - `versionlens.npm.showTaggedVersions` has been dropped in favour of this new change

  - `github.compareOptions` is now called `github.taggedCommits`. 
  
    `latest` will always be the latest `commit`. This field now only accepts ['Release', 'Tag'] which is the default filter

# 0.14.1
  - Fixed a case where npm view doesn't return latest tag as the first entry.

# 0.14.0
  - Added ability to view versions associated with dist tags for npm and jspm.

    Example:

    ![image](https://cloud.githubusercontent.com/assets/1727302/25671395/c913e674-3027-11e7-910e-51a17905215c.png)

    - To enable set `versionlens.npm.showTaggedVersions: true`
    - To filter out packages that have many unwanted dist tags you can set a preferred list using `versionlens.npm.distTagFilter`.

      Example: `versionlens.npm.distTagFilter: ['alpha', 'beta', 'legacy', 'next']` will only show and order the dist tags as 'alpha', 'beta', 'legacy' and 'next'

  - Renamed 'statisfies' to 'Matches'
  - Fixed the ordering of github versions to always be ordered as releases, tags then commits
  - Removed ability to update all packages. 
    Sometimes this feature never worked because you first had to scroll all the packages in to view.
    Will work on a better method for this feature in the future.

# 0.13.0
  - Added dotnet core csproj file support. Thanks to [@eamodio](https://github.com/eamodio)

# 0.12.2
  - Fixes an issue where ranged versions (i.e. 1.x) were showing the incorrect update verion for npm and jspm
  - Moved error messages to the console. They should no longer appear as a code lens

# 0.12.1
  - Fixes an issue where code lenses were not showing for jspm in package.json
  
# 0.12.0

  - Adds ability to provide github access token to avoid github api rate limiting

    Tokens can be provided by setting `versionlens.github.accessToken` in your user settings. To generate a token see https://help.github.com/articles/creating-an-access-token-for-command-line-use/#creating-a-token

    When no token is provided then access to the api will be rate limited to 60 requests every 10 minutes or so.

  - Adds indication for github packages that dont exist

  - Project dependency properties can now be customised via vscode settings. The default settings keep the previoussetup so nothing will break.

    ```json
    // vscode settings.json example
    {
      "versionlens.npm.dependencyProperties": [
        "dependencies",
        "devDependencies",
        "peerDependencies",
        "optionalDependencies",
        "myCustomDependencies"
      ]
    }
    ```

# 0.11.0
  - Can now choose to update all packages within a dependency section. i.e. update all beneath devDependencies.

    ![update-all-example](https://cloud.githubusercontent.com/assets/1727302/20415826/c7244f98-ad32-11e6-9c25-ada420828d8c.gif)

    **Note**

      - Because code lenses are not generated until they are viewed in the editor then only code lenses that have been viewed since opening the document can be updated. 
        If you have many dependencies that go off the screen then just scroll them all in to view once before running the update all command for maximum coverage.
      - This functionality ignores github and file package entries.

  - Now checks if an npm `file:` package path exists and provides indication when the resource does not exist.

    ![file-existence](https://cloud.githubusercontent.com/assets/1727302/20415939/7b1843d8-ad33-11e6-8444-bc4ae6d8e555.gif)

# 0.10.0
  - Added github commitish support for npm, jspm and bower. Doesn't support pre-releases yet.

    ![npm-comittish](https://cloud.githubusercontent.com/assets/1727302/20376535/69a638a8-ac7f-11e6-8408-857759c21106.gif)

    Also supports semver releases\tags 

    ![npm-comittish2](https://cloud.githubusercontent.com/assets/1727302/20376610/1669b59c-ac80-11e6-9415-94ed83066f0b.gif)

# 0.9.1
  - Fixes invalid message when using tags i.e. @next

# 0.9.0
  - Github and local file system packages are now treated as clickable links that browse to their respective destinations. (git urls are not implemented yet)

# 0.8.0
  - Added support for npm private packages and private registries

# 0.7.1
  - Replaces update arrow indicator to be a unicode charachter due to change in vscode 1.7. See https://github.com/Microsoft/vscode/issues/13714 for more info.

# 0.7.0
  - Adds support for preserving some semver operators when updating

# 0.6.0
  - Added jspm package support

# 0.5.0
  - Added npm scoped packages support

# 0.4.3
  - Fixes versionlens for dub sub packages

# 0.4.2
  - Transferred this project over to https://github.com/vscode-contrib/vscode-versionlens

# 0.4.1
  - Replaces internal json module with external
  - Replaces internal request module with external

# 0.4.0
  - Adds dotnet project.json support
  - Fixes issue when a child version entry is not present

# 0.3.0
  - Adds dub dub.json support
