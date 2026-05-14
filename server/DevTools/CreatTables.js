const knex = require('knex');
const config = require('../config.js');

const db = knex({
    client: 'pg',
    connection:config.TABLE_AUTHORIZATION
});

async function createTables() {
    try{
        const videoTableExistence = await db.schema.hasTable('videos');
        if(!videoTableExistence){
            console.log("Creating Table videos...")
            await db.schema.createTable('videos',(table) => {
                table.increments('id').primary();
                table.text('name').notNullable();
                table.text('duration');
                table.decimal('size_mb');
                table.text('category');
                table.boolean('isitunique').defaultTo(false);
                table.boolean('filtered').defaultTo(false);
                table.timestamp('created_at').defaultTo(db.fn.now());
            });
        };
        const linksTableExistence = await db.schema.hasTable('links');
        if(!linksTableExistence){
            console.log("Creating Table links...")
            await db.schema.createTable('links',(table) => {
                table.increments('id').primary();
                table.text('name').notNullable();
                table.text('category');
                table.boolean('locked').defaultTo(false);
                table.boolean('isitunique').defaultTo(false);
                table.timestamp('last_updated');
                table.timestamp('created_at').defaultTo(db.fn.now());
            });
        }
        const logsTableExistence = await db.schema.hasTable('logs');
        if(!logsTableExistence){
            console.log("Creating Table logs...")
            await db.schema.createTable('logs',(table) => {
                table.increments('id').primary();
                table.text('log_type').notNullable();
                table.text('log');
                table.timestamp('created_at').defaultTo(db.fn.now());
            });
        };
        console.log("✅ All done");
        return true;
    }catch(err){
        console.error(`Error while creating tables in SQL : ${err}`)
        return null;
    }finally{
        await db.destroy();
    }
};

createTables()