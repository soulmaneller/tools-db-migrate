const fs            = require( 'fs' );
const path          = require( 'path' );
const inquirer      = require( 'inquirer' );
const fuzzy         = require( 'fuzzy' );
const _             = require( 'lodash' );

inquirer.registerPrompt( 'autocomplete', require( 'inquirer-autocomplete-prompt' ));

function ask( opts ) {
    const defaultOpts = {
        migrationPath: 'migrations'
    };

    opts = _.merge( {}, defaultOpts, opts );
    let questions = [
        {
            type: 'list',
            name: 'method',
            message: 'Select the method',
            choices: [
                {
                    name: 'Create a new migration file',
                    value: 'create'
                },
                {
                    name: 'Upgrade database',
                    value: 'up'
                },
                {
                    name: 'Downgrade database',
                    value: 'down'
                },
                {
                    name: 'Create a database',
                    value: 'createDatabase'
                },
                {
                    name: 'Drop a database',
                    value: 'dropDatabase'
                },
                new inquirer.Separator(),
                {
                    name: 'Reset database (Rollback all migrations)',
                    value: 'reset'
                },
            ]
        },
        {
            type: 'list',
            name: 'env',
            message: `Select the environment`,
            choices: () => {
                const nonEnvList = [ 'defaultEnv', 'sql-file' ];
                let envList = Object.keys( opts.config ).filter( item => nonEnvList.indexOf( item ) === -1 );
                return envList;
            },
            default: _.get( opts, 'config.defaultEnv' ),
            when: ans => [ 'up', 'down', 'createDatabase', 'dropDatabase', 'reset' ].indexOf( ans.method ) !== -1
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
            when: ans => [ 'create', 'createDatabase', 'dropDatabase' ].indexOf( ans.method ) !== -1,
            validate: ans => ans.length > 0
        },
        {
            type: 'input',
            name: 'name',
            message: ( ans ) => {
                let mapper = {
                    'up': '[Optional] Enter name of file or number of steps',
                    'down': '[Optional] Enter name of file or number of steps',
                };

                return mapper[ ans.method ];
            },
            when: ans => [ 'up', 'down' ].indexOf( ans.method ) !== -1,
        },
        {
            type: 'autocomplete',
            name: 'scope',
            message: '[Optional] Enter scope name',
            when: ans => [ 'create', 'up', 'down', 'reset' ].indexOf( ans.method ) !== -1,
            suggestOnly: true,
            source: ( ans, input ) => {
                input = input || '';
                let list = [];
                if( fs.existsSync( opts.migrationPath )) {
                    list = fs.readdirSync( opts.migrationPath );
                    list = getDirList( opts.migrationPath, list, { ignore: [ 'sqls' ]});
                }

                return new Promise(function(resolve) {
                    var fuzzyResult = fuzzy.filter(input, list);
                    resolve(fuzzyResult.map(function(el) {
                        return el.original;
                    }));
                });
            },
            validate: () => true
        },
        {
            type: 'confirm',
            name: 'confirm',
            message: ( ans ) => {
                let msg = JSON.stringify( ans, null, 2 ) + '\n\n';
                msg = msg + `Are you sure?`;
                return msg;
            },
            default: ans => [ 'reset', 'dropDatabase', 'down' ].indexOf( ans.method ) !== -1 ? false : true
        },
    ];

    return inquirer.prompt( questions );
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

module.exports = {
    ask: ask
};
