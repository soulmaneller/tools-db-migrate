const { series }    = require( 'async' );
const dbMigrate     = require( 'db-migrate' );
const _             = require( 'lodash' );

function getMethod( dbm, list ) {
    let obj = {};
    list.forEach(( item ) => {
        obj[ item ] = dbm[ item ].bind( dbm );
    });
    return obj;
}

module.exports = ( config, opts ) => {
    const defaultOpts = {
        env: 'dev'
    };

    opts        = _.merge( {}, defaultOpts, opts );
    const dbm   = dbMigrate.getInstance( true, { env: opts.env, config: config });
    let methods = getMethod( dbm, [ 'up', 'down', 'reset', 'create', 'createDatabase', 'dropDatabase' ]);

    methods.refresh = ( scope, callback ) => {
        if( typeof scope === 'function' ) {
            callback = scope;
            scope = '';
        }

        series([
            ( cb ) => {
                console.log( `> Rolling back data...` );
                dbm.reset( scope, cb );
            },
            ( cb ) => {
                console.log( `> Inserting data...` );
                dbm.up( '', scope, cb );
            },
        ], ( err ) => {
            if( err ) {
                console.log( err.message );
            }
            callback( err );
        });
    };

    return methods;
};
