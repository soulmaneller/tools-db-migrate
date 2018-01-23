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
        .option( '-e, --env [environment_name]', `Environment name [Default: 'test']` )
        .option( '-f, --file [config_path]', `Config file path [Default: './database.json']` )
        .option( '-c, --config [config_object]', `Config json object` )
        .option( '-p, --path [data_path]', `Data path for config object` );

    program
        .command( 'up [count] [scope]')
        .description( 'Upgrade database' )
        .action( migrate( 'up' ));

    program
        .command( 'down [count] [scope]')
        .description( 'Downgrade database' )
        .action( migrate( 'down' ));

    program.parse( process.argv );

    if( program.args.length > 0 ) {
        return;
    }

    const config = getConfig( program );
    let opts = {
        migrationPath: 'migrations',
        config: config
    };

    question.ask( opts ).then(( ans ) => {
        if( !ans.confirm ) {
            return;
        }

        ans = _.get.bind( null, ans );
        migrate( ans( 'method' ), config, ans( 'env', null ) || program.env )( ans( "name", undefined ), ans( "scope", undefined ));
    });
} else {
    module.exports = require( './lib/dbm' );
}

function migrate( method, conf, env ) {
    return function( name, scope ) {
        const opts      = this ? ( this.parent || this ) : {};
        const config    = conf || getConfig( opts );
        const dbmOpts   = {
            env: env || opts.env || 'test'
        };

        const dbm       = require( './lib/dbm' )( config, dbmOpts );
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
    };
}

function getConfig( p ) {
    let configPath  = p.file || 'database.json';
    let dataPath    = p.path;
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
        if( typeof config === 'function' ) {
            config = config( dataPath );
        } else {
            config = _.get( config, dataPath, null );
        }
    }
    return config;
}
