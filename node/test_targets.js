var winston = require('winston');
var _logger = winston.loggers.get('winston');

/********************************/
/*  Test function for callbacks */
/********************************/

var cbTest = function(name)
{
    return function()
    {
        _logger.info('Callback function of "' + name + '" ... finished.');
    }
}

/********************************/
/*         Test target         */
/********************************/
var TestTarget1 = function()
{
    this.first = function(n, cb)
    {
        _logger.info('Sleep... ');
         // do nothing
        var now = new Date().getTime();
        while(new Date().getTime() < now + 1111) {}
        process.nextTick(cb);
    }
    this.second = function(n)
    {
        _logger.info('Sleep... ');
         // do nothing
        var now = new Date().getTime();
        while(new Date().getTime() < now + 1233) {}
    }
    this.third = function(n, cb)
    {
        _logger.info('Sleep... ');
         // do nothing
        var now = new Date().getTime();
        while(new Date().getTime() < now + 1234) {}
        process.nextTick(cb);
    }
}

var TestTarget2 = function()
{
    this.foo = function(n)
    {
        _logger.info('Sleep... ');
         // do nothing
        var now = new Date().getTime();
        while(new Date().getTime() < now + 300) {}
    }
    this.bar = function(n, cb)
    {
        _logger.info('Sleep... ');
         // do nothing
        var now = new Date().getTime();
        while(new Date().getTime() < now + 200) {}
        process.nextTick(cb);
    }
    this.foofoo = function(n, m, func, cb)
    {
        _logger.info('Sleep... ');
         // do nothing
        var now = new Date().getTime();
        while(new Date().getTime() < now + 1000) {}
        process.nextTick(cb);
    }
    this.barbar = function(cb)
    {
        _logger.info('Sleep... ');
         // do nothing
        var now = new Date().getTime();
        while(new Date().getTime() < now + 500) {}
        process.nextTick(cb);
    }
}

module.exports.TestTarget2 = TestTarget2;
module.exports.TestTarget1 = TestTarget1;
module.exports.cbTest      = cbTest;
