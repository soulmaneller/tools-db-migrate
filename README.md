# How to use

## Installation

    npm install git+https://github.com/soulmaneller/tools-db-migrate

## Configuration

Create a file `database.json` in your root project

```JSON
{
    "dev": {
        "driver": "mysql",
        "user": "[username]",
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
    ...
    "scripts": {
        "migrate": "tools-db-migrate"
    }
    ...
}
```

- Run `npm run imgrate`
