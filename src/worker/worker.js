/**
 * @file Worker
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */


import { Log, Debug, MainScriptFilePath, WorkerRegistry } from "../globals.js";


function Worker( name ){

    var pending = 0;
    var postCount = 0;
    var onmessageDict = {};
    var onerrorDict = {};

    var worker = new self.Worker( MainScriptFilePath );

    WorkerRegistry.activeWorkerCount += 1;

    worker.onmessage = function( event ){

        pending -= 1;
        var postId = event.data.__postId;

        Log.timeEnd( "Worker.postMessage " + name + " #" + postId );

        if( onmessageDict[ postId ] ){
            onmessageDict[ postId ].call( worker, event );
        }else{
            // Log.debug( "No onmessage", postId, name );
        }

        delete onmessageDict[ postId ];
        delete onerrorDict[ postId ];

    };

    worker.onerror = function( event ){

        pending -= 1;
        var postId = event.data.__postId;

        if( onerrorDict[ postId ] ){
            onerrorDict[ postId ].call( worker, event );
        }else{
            Log.error( "Worker.onerror", postId, name, event );
        }

        delete onmessageDict[ postId ];
        delete onerrorDict[ postId ];

    };

    // API

    this.name = name;

    this.post = function( aMessage, transferList, onmessage, onerror ){

        onmessageDict[ postCount ] = onmessage;
        onerrorDict[ postCount ] = onerror;

        aMessage = aMessage || {};
        aMessage.__name = name;
        aMessage.__postId = postCount;
        aMessage.__debug = Debug;

        Log.time( "Worker.postMessage " + name + " #" + postCount );

        try{
            worker.postMessage.call( worker, aMessage, transferList );
        }catch( error ){
            Log.error( "worker.post:", error );
            worker.postMessage.call( worker, aMessage );
        }

        pending += 1;
        postCount += 1;

        return this;

    };

    this.terminate = function(){

        if( worker ){
            worker.terminate();
            WorkerRegistry.activeWorkerCount -= 1;
        }else{
            Log.log( "no worker to terminate" );
        }

    };

    Object.defineProperties( this, {
        postCount: {
            get: function(){ return postCount; }
        },
        pending: {
            get: function(){ return pending; }
        }
    } );

}

Worker.prototype.constructor = Worker;


export default Worker;