# katalon-concordia

> Chrome/Firefox extension for transforming Katalon tests into Concordia Language

This extension converts test scripts recorded with [Katalon Recorder](https://www.katalon.com/resources-center/blog/katalon-automation-recorder/) into sentences in [Concordia Language](http://concordialang.org).

![Using](media/using.gif)


## Install

Before installing, make sure you have [Katalon Recorder](https://www.katalon.com/resources-center/blog/katalon-automation-recorder/) installed.

1. [Download](https://github.com/thiagodp/katalon-concordia/archive/master.zip) the zip file
2. Extract the file to a folder
3. In **Google Chrome** only:
    1. Enter `chrome://extensions` in the URL bar
    2. Enable **Developer Mode** in the top right corner
    3. Click **Load unpacked extension...**
    4. Select the folder where you had extracted the files
4. In **Mozilla Firefox** only:
    1. Enter `about:addons` in the URL bar
    2. Click on the gear icon (⛭) and then on **Install Add-on From File...**
    3. Select the .zip file

**Note**: *If you receive a message like "corrupted file" in Firefox, it's because the extension was not signed. In this case, try the following:*
1. Enter `about:debugging` in the URL bar
2. Click **Load Temporary Add-on**
3. Select the folder where you had extracted the files


## Update

Just remove the extension and then install it again, or...

In **Google Chrome** only:
1. [Download](https://github.com/thiagodp/katalon-concordia/archive/master.zip) the zipped file
2. Extract it to the same folder as where it was installed
3. Enter `chrome://extensions` in the URL bar
4. Find the extension and click on the reload icon (⟳)


## How to Use

1. Open the extension [Katalon Automation Recorder]((https://www.katalon.com/resources-center/blog/katalon-automation-recorder/))
2. Select a Test Case
3. Click **Export**
4. In **Format**, select **Concordia Language**
5. Click **Copy to Clipboard** OR **Save as File...**


## Currently supported commands

- `assertTitle`
- `click`
- `close`
- `doubleClick`
- `open`
- `pause`
- `selectWindow`
- `sendKeys`
- `submit`
- `type`
- `verifyElementPresent`
- `verifyText`
- `verifyTextPresent`
- `verifyTitle`
- `waitForElementPresent`
- `waitForPageToLoad`

More commands will be supported soon. Click on [Watch](https://github.com/thiagodp/katalon-concordia/subscription) in the top right corner to know about any news.

👉 [Open an Issue](https://github.com/thiagodp/katalon-concordia/issues/new) for a command you need frequently.


## See also

- [Concordia actions in English](https://github.com/thiagodp/concordialang/blob/master/docs/actions.md)
- [Concordia actions in Portuguese](https://github.com/thiagodp/concordialang/blob/master/docs/actions-pt.md)


## License

![AGPL](http://www.gnu.org/graphics/agplv3-88x31.png) © [Thiago Delgado Pinto](https://github.com/thiagodp)

[GNU Affero General Public License version 3](LICENSE.txt)