self.addEventListener('message', (m) => {
 // Create an Int32Array on top of that shared memory area
 const sharedArray = new Uint32Array(m.data)
            
 while (1) {
     //iterations of uint32 values over 2^31 are much slower in firefox
     if(sharedArray[0] > 2000000000)
        sharedArray[0] = 0;
 
     sharedArray[0]++;
 }
});
