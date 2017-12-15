#!/usr/bin/env node
"use strict";
const fs            = require( 'fs' );
const path          = require( 'path' );
const inquirer      = require( 'inquirer' );
const chalk         = require( 'chalk' );
const dbMigrate     = require( 'db-migrate' );
const fuzzy         = require( 'fuzzy' );
const _             = require( 'lodash' );

const dbm           = dbMigrate.getInstance( true );
const migrationPath = 'migrations';
inquirer.registerPrompt( 'autocomplete', require( 'inquirer-autocomplete-prompt' ));
let questions = [
    {
        type: 'list',
        name: 'method',
        message: 'Select the method',
        choices: [
            {
                name: 'Create',
                value: 'create'
            },
            {
                name: 'Up',
                value: 'up'
            },
            {
                name: 'Down',
                value: 'down'
            },
            {
                name: 'Create database',
                value: 'createDatabase'
            },
            {
                name: 'Drop database',
                value: 'dropDatabase'
            },
            new inquirer.Separator(),
            {
                name: 'Reset',
                value: 'reset'
            },
        ]
    },
    {
        type: 'input',
        name: 'name',
        message: ( ans ) => {
            let mapper = {
                'create': 'Enter migration name',
                'createDatabase': 'Enter database name',
                'dropDatabase': 'Enter database name',
            };

            return mapper[ ans.method ];
        },
        when: ( ans ) => {
            let arr = [ 'create', 'createDatabase', 'dropDatabase' ];
            return arr.indexOf( ans.method ) !== -1;
        },
        validate: ans => ans.length > 0
    },
    {
        type: 'autocomplete',
        name: 'scope',
        message: '[Optional] Enter scope name',
        when: ans => ans.method === 'create',
        suggestOnly: true,
        source: ( ans, input ) => {
            input = input || '';
            let list = fs.readdirSync( migrationPath );
            list = getDirList( migrationPath, list, { ignore: [ 'sqls' ]});

            return new Promise(function(resolve) {
                var fuzzyResult = fuzzy.filter(input, list);
                resolve(fuzzyResult.map(function(el) {
                    return el.original;
                }));
            });
        }
    },
    {
        type: 'confirm',
        name: 'confirm',
        message: ( ans ) => {
            let msg = JSON.stringify( ans, null, 2 ) + '\n\n';
            msg = msg + `Are you sure?`;
            return msg;
        },
        default: ans => ans.method === 'reset' ? false : true
    },
];

proc();

async function proc() {
    const ans = await inquirer.prompt( questions );
    if( !ans.confirm ) {
        return;
    }

    const method    = ans.method;
    const name      = ans.name || undefined;
    const scope     = ans.scope || undefined;

    let output = await dbm[ method ]( name, scope );
    if( output ) {
        console.log( chalk.bgRed( `----------------- error -----------------` ));
        return console.log( output );
    }

    console.log( chalk.green( 'success!' ));
}

function getDirList( rootPath, list, opts ) {
    opts = _.merge( {
        ignore: [],
    }, opts );

    let output = list.filter(( item ) => {
        let target = path.join( rootPath, item );
        return fs.statSync( target ).isDirectory() && opts.ignore.indexOf( item ) === -1;
    });
    return output;
}
