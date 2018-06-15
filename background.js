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
                    // {
                    //     id: 'concordia-en',
                    //     summary: 'Concordia Language in English',
                    //     type: 'export'
                    // },
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


    var commandToConcordiaPt = function commandToConcordiaPt( command, index ) {

        var prefix = ! index ? '  Quando eu ' : '    e eu ';
        var prefixThen = '  Então eu ';
        var cmd = command.command;
        var hasTarget = ( command.target !== undefined && command.target !== null );
        var hasValue = ( command.target !== undefined && command.target !== null );
        var wrappedTarget;
        var wrappedValue = '"' + ( command.value || '' ) + '"';
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

        if ( 'click' === cmd || 'submit' === cmd ) {
            return prefix + 'clico em ' + ( hasTarget ? wrappedTarget : wrappedValue );
        }

        if ( 'close' === cmd ) {
            return prefix + 'fecho a janela ' + wrappedTarget;
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
    };


    var commandsToConcordia = function commandsToConcordia( commands, language ) {
        var content = '';
        var len = commands.length;
        for ( var i = 0; i < len; ++i ) {
            var command = commands[ i ];
            if ( 'pt' === language ) {
                content += commandToConcordiaPt( command, i ) + '\n';
            }
        }
        return content;
    };


    if ( 'katalon_recorder_export' === message.type ) {

        var payload = message.payload;
        var commands = payload.commands;

        var outputPayload = {
            content: 'Invalid capability ID',
            extension: 'concordia',
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
