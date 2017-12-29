#!/usr/bin/env node
"use strict";
const fs            = require( 'fs-extra' );
const path          = require( 'path' );
const _             = require( 'lodash' );
const chalk         = require( 'chalk' );
const program       = require( 'commander' );
const question      = require( './lib/question' );

const pkg           = fs.readJsonSync( 'package.json' );

if (require.main === module) {
    program
        .version( pkg.version )
        .usage( '[options]' )
        .option( '-f, --file [config_path]', `Config file path [Default: './database.json']` )
        .option( '-c, --config [config_object]', `Config json object` )
        .option( '-p, --path [data_path]', `Data path for config object` )
        .parse( process.argv );

    let configPath = program.file || 'database.json';
    let dataPath = program.path;
    let config;
    if( configPath ) {
        let ext = path.extname( configPath );

        if( ext === '.js' ) {
            let targetPath = path.relative( __dirname, path.join( process.cwd(), configPath ));
            config = require( `./${ targetPath }` );
        } else if( ext === '.json' ) {
            if( fs.existsSync( configPath ) === false ) {
                throw new Error( `File ${ configPath } not exists` );
            }
            config = fs.readJsonSync( configPath );
        } else {
            throw new Error( `Extension of config file is incorrect` );
        }
    }

    if( dataPath ) {
        config = _.get( config, dataPath, null );
    }

    let opts = {
        migrationPath: 'migrations',
        config: config
    };

    question.ask( opts ).then(( ans ) => {
        if( !ans.confirm ) {
            return;
        }

        let dbmOpts = {
            env: ans.env || 'dev',
        };

        const dbm       = require( './lib/dbm' )( config, dbmOpts );
        const method    = ans.method;
        const name      = ans.name || undefined;
        const scope     = ans.scope || undefined;

        let params = [
            ( err ) => {
                if( err ) {
                    console.log( `${ chalk.red( '>') } Error:` );
                    console.log( err.message );
                    return;
                }
                console.log( chalk.green( 'success!' ));
            }
        ];

        params.unshift( name, scope );

        if( method === 'reset' ) {
            params.shift();
        }

        dbm[ method ].apply( null, params );
    });
} else {
    module.exports = require( './lib/dbm' );
}
