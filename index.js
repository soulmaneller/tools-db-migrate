#!/usr/bin/env node
"use strict";
const chalk         = require( 'chalk' );
const dbMigrate     = require( 'db-migrate' );

const dbm           = dbMigrate.getInstance( true );
const question      = require( './lib/question' );

proc();

async function proc() {
    let opts = {
        migrationPath: 'migrations'
    };
    const ans = await question.ask( opts );
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
