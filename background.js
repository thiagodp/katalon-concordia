/**
 * Katalon to Concordia Language converter.
 *
 * @author Thiago Delgado Pinto
 *
 * @see https://github.com/thiagodp/katalon-concordia
 * @see http://concordialang.org
 */

// TEMPORARY IDs !!!
// TO-DO: register to Chrome Store and Firefox AMO
var extensionId = bowser.firefox // bowser (not browser!) will detect the browser
    ? '{91f05833-bab1-4fb1-b9e4-187091a4d75d}' // firefox
    : 'ljdobmomdgdljniojadhoplhkpialdid'; // chrome

/*
Periodically send a message to Katalon Recorder with a list of capabilities. If Katalon Recorder does not receive any message for 2 minutes, it will stop communicating with the plugin.

Message structure:
{
    type: 'katalon_recorder_register',
    payload: {
        capabilities: [
            {
                id: <string: unique ID for capability>,
                summary: <string: user-friendly name, e.g script format>,
                type: <right now only 'export' is available>
            }
        ]
    }
}
*/
function register() {
    chrome.runtime.sendMessage(
        extensionId,
        {
            type: 'katalon_recorder_register',
            payload: {
                capabilities: [
                    {
                        id: 'concordia-en',
                        summary: 'Concordia Language in English',
                        type: 'export'
                    },
                    {
                        id: 'concordia-pt',
                        summary: 'Concordia Language in Portuguese',
                        type: 'export'
                    },
                    // {
                    //     id: 'json',
                    //     summary: 'JSON',
                    //     type: 'export'
                    // }
                ]
            }
        }
    );
}

register();

setInterval( register, 60 * 1000 );

/*
Message sent from Katalon Recorder for the plugin to process.

{
    type: <right now only 'katalon_recorder_export' is available>,
    payload: {
        capabilityId: <sent from plugin in katalon_recorder_register message, use this ID to differentiate between capabilites>
        commands: [
            {
                command: <command name>,
                target: <command target>,
                value: <command value>
            }
        ]
    }
}

Response structure when message.type === 'katalon_recorder_export':
{
    status: <boolean - whether the access was processed successfully>,
    payload: {
        content: <the exported script>,
        extension: <extension when user wants to download the exported script>,
        mimetype: <Katalon Recorder's code editor will use this mimetype to provide syntax highlighting>
    }
}
*/
chrome.runtime.onMessageExternal.addListener( function( message, sender, sendResponse ) {

    if ( 'katalon_recorder_export' === message.type ) {

        var payload = message.payload;
        var commands = payload.commands;

        var outputPayload = {
            content: 'Invalid capability ID',
            extension: 'feature',
            mimetype: 'text/plain'
        };

        switch ( payload.capabilityId ) {
            case 'concordia-en':
                outputPayload.content = commandsToConcordia( commands, 'en' );
                break;
            case 'concordia-pt':
                outputPayload.content = commandsToConcordia( commands, 'pt' );
                break;
            // case 'json':
            //     outputPayload.content = JSON.stringify( commands );
            //     outputPayload.extension = 'json';
            //     outputPayload.mimetype = 'application/ld-json';
            //     break;
            default:
                outputPayload.content = 'Invalid capability ID';
        }

        sendResponse( {
            status: true,
            payload: outputPayload
        } );
    }
} );

function commandsToConcordia( commands, language ) {
    var content = '';
    var len = commands.length;
    for ( var i = 0; i < len; ++i ) {
        var command = commands[ i ];
        if ( 'pt' === language ) {
            content += commandToConcordiaPt( command, i ) + '\n';
        } else if ( 'en' === language ) {
            content += commandToConcordiaEn( command, i ) + '\n';
        }
    }
    return content;
}

function commandToConcordiaPt( command, index ) {

    var prefix = ! index ? '  Quando eu ' : '    e eu ';
    var prefixThen = '  Então eu ';
    var cmd = command.command;
    var hasTarget = ( command.target !== undefined && command.target !== null );
    var hasValue = ( command.target !== undefined && command.target !== null );
    var wrappedTarget;
    var wrappedValue;

    if ( hasTarget ) {
        var target = command.target;
        if ( 0 === target.indexOf( 'name=' ) ) {
            target = '@' + target.substr( 'name='.length );
        } else if ( 0 === target.indexOf( 'id=' ) ) {
            target = '#' + target.substr( 'id='.length );
        } else if ( 0 === target.indexOf( 'link=' ) ) {
            target = target.substr( 'link='.length );
        }
        wrappedTarget = '<' + ( target || '' ) + '>';
    } else {
        wrappedTarget = '<' + ( command.target || '' ) + '>';
    }

    if ( hasValue ) {
        var value = command.value;
        if ( 0 === value.indexOf( 'label=' ) ) {
            value = value.substr( 'label='.length );
        } else if ( 0 === value.indexOf( 'name=' ) ) {
            value = value.substr( 'name='.length );
        } else if ( 0 === value.indexOf( 'id=' ) ) {
            value = value.substr( 'id='.length );
        } else if ( 0 === value.indexOf( 'link=' ) ) {
            value = value.substr( 'link='.length );
        }
        wrappedValue = '"' + ( value || '' ) + '"';
    } else {
        wrappedValue = '"' + ( command.value || '' ) + '"'
    }

    if ( 'click' === cmd || 'submit' === cmd ) {
        return prefix + 'clico em ' + ( hasTarget ? wrappedTarget : wrappedValue );
    }

    if ( 'close' === cmd ) {
        return prefix + 'fecho a janela ' + wrappedTarget;
    }

    if ( 'doubleClick' === cmd ) {
        return prefix + 'dou um duplo clique em ' + wrappedTarget;
    }

    if ( 'select' === cmd ) {
        return prefix + 'seleciono ' + wrappedValue + ' em ' + wrappedTarget;
    }

    if ( 'selectWindow' === cmd ) {
        return prefix + 'abro a janela ' + wrappedTarget;
    }

    if ( 'open' === cmd ) {
        return prefix + 'estou em "' + ( command.target || command.value ) + '"';
    }

    if ( 'pause' === cmd ) {
        var intVal = parseInt( command.value );
        if ( ! isNaN( intVal ) ) {
            intVal = 1;
        } else if ( intVal < 1000 ) {
            intVal = 1;
        } else {
            intVal = intVal / 1000;
        }
        return prefix + 'aguardo ' + intVal + ( ( intVal > 1 ) ? ' segundos' : ' segundo' );
    }

    if ( 'sendKeys' === cmd ) {
        return prefix + 'pressiono ' + convertAllKeys( command.value );
    }

    if ( 'type' === cmd ) {
        return prefix + 'informo ' + wrappedValue + ' em ' + wrappedTarget;
    }

    if ( 'verifyElementPresent' === cmd ) {
        if ( hasValue ) {
            return prefixThen + 'vejo que ' + wrappedTarget + ' possui ' + wrappedValue;
        }
        return prefixThen + 'vejo ' + wrappedTarget;
    }

    if ( 'verifyText' === cmd ) {
        if ( hasTarget ) {
            return prefixThen + 'vejo que ' + wrappedTarget + ' possui ' + wrappedValue;
        }
        return prefixThen + 'vejo o texto ' + wrappedValue;
    }

    if ( 'verifyTextPresent' == cmd ) {
        return prefixThen + 'vejo o texto "' + ( command.target || command.value ) + '"';
    }

    if ( 'verifyTitle' === cmd || 'assertTitle' === cmd ) {
        return prefixThen + 'vejo o título com ' + wrappedValue;
    }

    if ( 'waitForElementPresent' === cmd ) {
        return prefix + 'espero por ' + wrappedTarget;
    }

    if ( 'waitForPageToLoad' === cmd ) {
        return prefix + 'espero pela url ' + wrappedTarget;
    }

    return '# Não consegui entender o comando: ' + JSON.stringify( command );
}


function commandToConcordiaEn( command, index ) {

    var prefix = ! index ? '  When I ' : '    and I ';
    var prefixThen = '  Then I ';
    var cmd = command.command;
    var hasTarget = ( command.target !== undefined && command.target !== null );
    var hasValue = ( command.target !== undefined && command.target !== null );
    var wrappedTarget;
    var wrappedValue;

    if ( hasTarget ) {
        var target = command.target;
        if ( 0 === target.indexOf( 'name=' ) ) {
            target = '@' + target.substr( 'name='.length );
        } else if ( 0 === target.indexOf( 'id=' ) ) {
            target = '#' + target.substr( 'id='.length );
        } else if ( 0 === target.indexOf( 'link=' ) ) {
            target = target.substr( 'link='.length );
        }
        wrappedTarget = '<' + ( target || '' ) + '>';
    } else {
        wrappedTarget = '<' + ( command.target || '' ) + '>';
    }

    if ( hasValue ) {
        var value = command.value;
        if ( 0 === value.indexOf( 'label=' ) ) {
            value = value.substr( 'label='.length );
        } else if ( 0 === value.indexOf( 'name=' ) ) {
            value = value.substr( 'name='.length );
        } else if ( 0 === value.indexOf( 'id=' ) ) {
            value = value.substr( 'id='.length );
        } else if ( 0 === value.indexOf( 'link=' ) ) {
            value = value.substr( 'link='.length );
        }
        wrappedValue = '"' + ( value || '' ) + '"';
    } else {
        wrappedValue = '"' + ( command.value || '' ) + '"'
    }

    if ( 'click' === cmd || 'submit' === cmd ) {
        return prefix + 'click on ' + ( hasTarget ? wrappedTarget : wrappedValue );
    }

    if ( 'close' === cmd ) {
        return prefix + 'close the window ' + wrappedTarget;
    }

    if ( 'doubleClick' === cmd ) {
        return prefix + 'double click ' + wrappedTarget;
    }

    if ( 'select' === cmd ) {
        return prefix + 'select ' + wrappedTarget + ' with ' + wrappedValue;
    }

    if ( 'selectWindow' === cmd ) {
        return prefix + 'open the window ' + wrappedTarget;
    }

    if ( 'open' === cmd ) {
        return prefix + 'am on "' + ( command.target || command.value ) + '"';
    }

    if ( 'pause' === cmd ) {
        var intVal = parseInt( command.value );
        if ( ! isNaN( intVal ) ) {
            intVal = 1;
        } else if ( intVal < 1000 ) {
            intVal = 1;
        } else {
            intVal = intVal / 1000;
        }
        return prefix + 'wait ' + intVal + ( ( intVal > 1 ) ? ' seconds' : ' second' );
    }

    if ( 'sendKeys' === cmd ) {
        return prefix + 'press ' + convertAllKeys( command.value );
    }

    if ( 'type' === cmd ) {
        return prefix + 'fill ' + wrappedTarget + ' with ' + wrappedValue;
    }

    if ( 'verifyElementPresent' === cmd ) {
        if ( hasValue ) {
            return prefixThen + 'see that ' + wrappedTarget + ' has ' + wrappedValue;
        }
        return prefixThen + 'see ' + wrappedTarget;
    }

    if ( 'verifyText' === cmd ) {
        if ( hasTarget ) {
            return prefixThen + 'see that ' + wrappedTarget + ' has the text ' + wrappedValue;
        }
        return prefixThen + 'see the text ' + wrappedValue;
    }

    if ( 'verifyTextPresent' == cmd ) {
        return prefixThen + 'see the text "' + ( command.target || command.value ) + '"';
    }

    if ( 'verifyTitle' === cmd || 'assertTitle' === cmd ) {
        return prefixThen + 'see the title with ' + wrappedValue;
    }

    if ( 'waitForElementPresent' === cmd ) {
        return prefix + 'wait for ' + wrappedTarget;
    }

    if ( 'waitForPageToLoad' === cmd ) {
        return prefix + 'wait for the url ' + wrappedTarget;
    }

    return '# Can\'t translate the command: ' + JSON.stringify( command );
}


function convertKey( key ) {
    // Different cases
    switch ( key ) {
        case 'KEY_DELETE': return 'Del';
        case 'KEY_BKSP': return 'Backspace';
        case 'KEY_PGUP': return 'PageUp';
        case 'KEY_PGDOWN': return 'PageDown';
    }
    // Normal cases
    var k = key;
    if ( k.indexOf( 'KEY_' ) >= 0 ) {
        k = k.substr( 'KEY_'.length ); // e.g., KEY_PAGE_UP -> PAGE_UP
        k = k.substr( 0, 1 ).toUpperCase() + k.substr( 1 ).toLowerCase(); // PAGE_UP -> Page_up
        var underlineIndex = k.indexOf( '_' );
        if ( underlineIndex > 0 ) {
            // Page_up -> PageUp
            k = k.substring( 0, underlineIndex - 1 ) +
                k.substr( underlineIndex + 1, 1 ).toUpperCase() +
                k.substr( underlineIndex + 2 ).toLowerCase();
        }
    }
    return k;
}

function convertAllKeys( allKeysStr ) {
    var len = allKeysStr.length;
    if ( allKeysStr.charAt( len - 1 ) === '}' ) {
        allKeysStr = allKeysStr.substr( 0, len - 1 );
    }
    var values = allKeysStr.split( /\}?\$\{/ );
    len = values.length, val = '';
    var keys = [];
    for ( var i = 0; i < len; ++i ) {
        val = convertKey( values[ i ] );
        if ( val.trim().length > 0 ) {
            keys.push( val );
        }
    }
    return '"' + keys.join( '", "' ) + '"';
}