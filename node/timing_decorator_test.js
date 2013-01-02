var assert = require("assert");
var winston = require('winston');
var logger = winston.loggers.get('winston');
var should = require('should');
var decorator = require('./timing_decorator.js');
var targets = require('./test_targets.js');


describe('TimingDecorator', function() {
    
    it('should pass without errors', function(done){
    	var tar = new targets.TestTarget1();
	    var dec = new decorator.TimingDecorator(tar);
	    // test initialisation of objects
	    tar.should.be.an.instanceof(targets.TestTarget1);
	    dec.should.be.an.instanceof(decorator.TimingDecorator);
	    tar.should.have.ownProperty('first');
	    tar.should.have.ownProperty('second');
	    tar.should.have.ownProperty('third');
	    // generate and call methods ~ test if methods were generated correctly 
	    dec.first('first', new targets.cbTest('first'));
	    dec.getGeneratedMethods().should.eql(['first']);
		dec.second('second');
	    dec.getGeneratedMethods().should.eql(['first','second']);
	    dec.third('third', new targets.cbTest('third'));
	    dec.getGeneratedMethods().should.eql(['first','second','third']);
    	// test if callback argument is recognized in methodgeneration
    	dec.getHasCallbacks().should.eql(['first', 'third']);
	    process.nextTick(function(){
	    	// test if callback functions get called
   			dec.getCallbackCalls().should.eql(['first', 'third']);
   			// are the timer functions called correctly for every method
   			// timestamp have to match an integer of length
		    dec.getTimerCalls()['first']['start'].should.match(/^\d{13}$/);
		    dec.getTimerCalls()['first']['stop'].should.match(/^\d{13}$/);
		    dec.getTimerCalls()['first']['delta'].should.match(/^\d{4}$/);
		    dec.getTimerCalls()['second']['start'].should.match(/^\d{13}$/);
		    dec.getTimerCalls()['second']['delta'].should.match(/^\d{4}$/);
		    dec.getTimerCalls()['second']['stop'].should.match(/^\d{13}$/);
		    dec.getTimerCalls()['third']['start'].should.match(/^\d{13}$/);
		    dec.getTimerCalls()['third']['stop'].should.match(/^\d{13}$/);
		    dec.getTimerCalls()['third']['delta'].should.match(/^\d{4}$/);
		    // time delta must not have a negative value
		    (function(){
		    	if(dec.getTimerCalls()['first']['delta'] < 0) throw new Error('negative delta');
		    	if(dec.getTimerCalls()['second']['delta'] < 0) throw new Error('negative delta');
		    	if(dec.getTimerCalls()['third']['delta'] < 0) throw new Error('negative delta');
		    }).should.not.throw();
		});
		done();
    });
});


describe('TimingDecorator initialisation', function() {
    
    it('run TimingDecorator ', function(done){
    	var tar = new targets.TestTarget1();
	  	// initialise TimingDecorator without testMock
	    (function(){
		    var dec = new decorator.TimingDecorator(tar);
		}).should.not.throw('target is null!');
		
	  	// initialise TimingDecorator with 0
	    (function(){
		    var dec = new decorator.TimingDecorator(0);
		}).should.throw();

	  	// initialise TimingDecorator with null
	    (function(){
		    var dec = new decorator.TimingDecorator(null);
		}).should.throw('target is null!');
		
	  	// initialise TimingDecorator with null
	    (function(){
		    var dec = new decorator.TimingDecorator(newDate());
		}).should.not.throw('target is null!');

		done();
    });
});


describe('TimingDecorator', function() {
    
    it('should pass without errors', function(done){
    	var tar = new targets.TestTarget2();
	    var dec = new decorator.TimingDecorator(tar);
	    // test initialisation of objects
	    (function(){
	    	tar.should.be.an.instanceof(targets.TestTarget1);
	    }).should.throw();
	    (function(){
	    	tar.should.be.an.instanceof(targets.TestTarget2);
	    }).should.not.throw();
	    dec.should.be.an.instanceof(decorator.TimingDecorator);
	    tar.should.have.ownProperty('foo');
	    tar.should.have.ownProperty('bar');
	    tar.should.have.ownProperty('foofoo');
	    tar.should.have.ownProperty('barbar');
	    // generate and call methods ~ test if methods were generated correctly 
	    dec.foo('foo');
	    dec.getGeneratedMethods().should.eql(['foo']);
		dec.bar('bar', new targets.cbTest('bar'));
	    dec.getGeneratedMethods().should.not.eql(['foo']);
	    dec.getGeneratedMethods().should.eql(['foo','bar']);
	    dec.foofoo('foofoo', 'm', function(){}, new targets.cbTest('foofoo'));
	    dec.getGeneratedMethods().should.eql(['foo','bar','foofoo']);
	    dec.barbar(new targets.cbTest('barbar'));
	    dec.getGeneratedMethods().should.eql(['foo','bar','foofoo', 'barbar']);
    	// test if callback argument is recognized in methodgeneration
    	dec.getHasCallbacks().should.eql(['bar', 'foofoo', 'barbar']);
	    
	    process.nextTick(function(){
	    	// test if callback functions get called
   			dec.getCallbackCalls().should.eql(['bar', 'foofoo', 'barbar']);
   			// are the timer functions called correctly for every method
   			// timestamp have to match an integer of length
		    dec.getTimerCalls()['foo']['start'].should.match(/^\d{13}$/);
		    dec.getTimerCalls()['foo']['stop'].should.match(/^\d{13}$/);
		    dec.getTimerCalls()['foo']['delta'].should.match(/^\d{3}$/);
		    dec.getTimerCalls()['bar']['start'].should.match(/^\d{13}$/);
		    dec.getTimerCalls()['bar']['stop'].should.match(/^\d{13}$/);
		    dec.getTimerCalls()['bar']['delta'].should.match(/^\d{4}$/);
		    dec.getTimerCalls()['foofoo']['start'].should.match(/^\d{13}$/);
		    dec.getTimerCalls()['foofoo']['stop'].should.match(/^\d{13}$/);
		    dec.getTimerCalls()['foofoo']['delta'].should.match(/^\d{4}$/);
		    dec.getTimerCalls()['barbar']['start'].should.match(/^\d{13}$/);
		    dec.getTimerCalls()['barbar']['stop'].should.match(/^\d{13}$/);
		    dec.getTimerCalls()['barbar']['delta'].should.match(/^\d{3}$/);
		    // time delta must not have a negative value
		    (function(){
		    	if(dec.getTimerCalls()['foo']['delta'] < 0) throw new Error('negative delta');
		    	if(dec.getTimerCalls()['bar']['delta'] < 0) throw new Error('negative delta');
		    	if(dec.getTimerCalls()['foofoo']['delta'] < 0) throw new Error('negative delta');
		    	if(dec.getTimerCalls()['barbar']['delta'] < 0) throw new Error('negative delta');
		    }).should.not.throw();
		});
		done();
    });
});
