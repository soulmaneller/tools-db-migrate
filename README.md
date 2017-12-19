# How to use

## Installation

**[Required]** nodejs version `8` or later

    npm install git+https://github.com/soulmaneller/tools-db-migrate

## Configuration

Create a file `database.json` in your root project

```Javascript
{
    "dev": { // Environment name
        "driver"  : "mysql",
        "user"    : "[username]",
        "password": "[password]",
        "database": "[database_name]"
    }
}
```
you can check from document [here](https://umigrate.readthedocs.io/projects/db-migrate/en/latest/Getting%20Started/configuration/)


## Usage

- Modify your `package.json` under property `scripts`

```JSON
{
    "scripts": {
        "migrate": "tools-db-migrate"
    }
}
```

- Run `npm run imgrate`

## Options

### Create a new migration file

Creating a new migration step

Parameters:

- **name**: Migration name
- **scope**: (Optional) scope of migration

the tools will create:

- `.js` 1 file, no need to change any thing in this file
- `.sql` 2 files, tools will create `-up.sql` and `-down.sql`

`up` is a script file for upgrade the database

`down` is a script file for downgrade the database (rollback), reverse step from `up`

### Upgrade database

Upgrade database by execute migration files which haven't executed, run `-up.sql` files

### Downgrade database

Downgrade database from current step of migration, `-down.sql` file

### Create a database

Parameters:

- **name**: Database name

Creating a new database directly from this tools

### Drop a database

Parameters:

- **name**: Database name

Drop a database directly from this tools, please check the name of database is correct

**Reset database (Rollback all migrations)**

Rollback all steps of migration, rollback to step `0`
