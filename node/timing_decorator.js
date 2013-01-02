var winston = require('winston');
var _logger = winston.loggers.get('winston');
  

 var TimingDecorator = function(target) {

    if(target == null || target === 0) throw new Error('target is null!');
    
    var _target           = target;
    var _this             = this; 

    // members for test purposes
    var _generatedMethods = [];
    var _timerCalls       = {};
    var _callbackCalls    = [];
    var _hasCallbacks     = [];

    // getter for test members
    this.getHasCallbacks = function()
    {
        return _hasCallbacks;
    }
    this.getGeneratedMethods = function()
    {
        return _generatedMethods;
    }
    this.getTimerCalls = function()
    {
        return _timerCalls;
    }
    this.getCallbackCalls = function()
    {
        return _callbackCalls;
    }

    // add data to timerCalls for testing
    var timerCall = function(methodName, method, timestamp)
    {
        _timerCalls[method] = _timerCalls[method] || {};
        _timerCalls[method][methodName] = timestamp;
    }

    // Timer object for time measurement
    var timer = function(methodName)
    {
        var name      = methodName;
        var startTime = 0;
        var stopTime  = 0;
        var delta     = 0;

        this.start = function()
        {
            startTime = new Date().getTime();
            _logger.info('Start: ' + startTime);
            // log this timer call for test purposes
            timerCall('start', methodName, startTime);
        }
        this.stop = function()
        {
            stopTime = new Date().getTime();
            _logger.info('Stop: ' + stopTime);
            // log this timer call for test purposes
            timerCall('stop', methodName, stopTime);
        }
        this.getDelta = function()
        {
            delta = stopTime - startTime;
            _logger.info('Delta ' + delta + ' ms');
            _logger.info('FUNCTION "' + name + '" TERMINATED AFTER: ' + delta + ' ms');
            timerCall('delta', methodName, delta);

            return delta;
        }
    }

    /**
     * Generate method and decorate the callback function with time measurement
     * Assume that the last parameter of the generated method is the callback function
     */
    var generateMethod = function(methodName)
    {
        _this[methodName] = function () {
            var t = new timer(methodName);
            // get the last argument
            var len  = arguments.length;
            var last = len > 0 ? arguments[len-1] : 0;
            // check if the last argument is (the callback) function
            if (typeof last == 'function') 
            {
                // decorate the callback function
                arguments[len-1] = callbackDecorator(t, last, methodName);

                // log for test purposes
                _generatedMethods.push(methodName);
                _hasCallbacks.push(methodName);

                _logger.info('Method "' + methodName + '" has a callback');
                // return the decorated function
                return methodDecorator(t, true, methodName, arguments);
            }
            
            // log for test purposes
            _generatedMethods.push(methodName);

            _logger.info('Method: "' + methodName + '" has no callback');
            return methodDecorator(t, false, methodName, arguments);
        };   
    }

    var deleteMethod = function(methodName) {
        delete _this[methodName];
        _logger.info('Deleted method name: ' + methodName);
    };

    /**
     * Generates module methods for each method found in the instance we retrieve
     * by getInstance.
     */
    var generateMethods = function() {
        _logger.info('Generate methods');
        // create delegates
        if (_target != null) {
            for (var methodName in _target) {
                if (typeof _target[methodName] == "function"
                        && _target.hasOwnProperty(methodName)) {
                    _logger.info('Generate method(' + methodName + ')');
                    generateMethod(methodName);
                }
            }
        }
    };

    /**
     * Decorate the callback function with the time measurement
     * Log the timestamp in time_t format(seconds since UNIX epoch)
     */
    var callbackDecorator = function(timer, callback, methodName)
    {             
        // return the decorated callback function
        return function()
        {
            // call the callback function
            _logger.info('Called callback function of "' + methodName + '"');
            callback();

            // log for test pusrposes
            _callbackCalls.push(methodName);

            // stop the timer after the callback 
            _logger.info('Stop timer in method: "' + methodName + '"');
            timer.stop(); 
            // DEBUG
            timer.getDelta();    
        }
    };

    /**
     * Decorate the method function with the time measurement
     * Log the timestamp in time_t format(seconds since UNIX epoch)
     */
    var methodDecorator = function(timer, hasCallback, methodName, args)
    { 
            // start the timer before calling the method
            _logger.info('Start timer in method "' + methodName + '"');
            timer.start(); 

            // call the method 
            _target[methodName].apply(_target, args);

            // if the method doesn't have any callback function, stop 
            //the timer after calling the method
            if (hasCallback === false)
            {
                timer.stop();
                _logger.info('Stop timer in method "' + methodName + '"');
                // DEBUG
                timer.getDelta(); 
            }
    };

    /**
     * @param {Function} func the callback function
     * @param {Object} opts an object literal with the following
     * properties (all optional):
     * scope: the object to bind the function to (what the "this" keyword will refer to)
     * args: an array of arguments to pass to the function when it is called, these will be
     * appended after any arguments passed by the caller
     * suppressArgs: boolean, whether to supress the arguments passed
     * by the caller. This default is false.
     */
    function callback(func, opts){  
        var opts = opts ? opts : {};
        var cb = function(){
            var args = opts.args ? opts.args : [];
            var scope = opts.scope ? opts.scope : this;
            var fargs = opts.supressArgs === true ?
                [] : toArray(arguments);
            func.apply(scope,fargs.concat(args));
        }
        return cb;
    }
     
    // Helper function for callback
    function toArray(arrayLike){
        var arr = [];
        for(var i = 0; i < arrayLike.length; i++){
            arr.push(arrayLike[i]);
        }
        return arr;
    }

    // geberate the proxy methods
    generateMethods();
}

module.exports.TimingDecorator = TimingDecorator;
