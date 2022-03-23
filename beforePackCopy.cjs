import cpy from 'cpy';

(async function(){

  try {

    await cpy([
      // 'src', // clone dir
      'src/**/*', // Copy all
      '!main.js', // Ignore 
      '!preload.js', // Ignore 
    ], 'build');
    // Copy node_modules to destination/node_modules
    // await cpy('src', 'build');  
    console.log('Copied');
  
  } catch (error) {
    console.log('Not copied');    
  }

})();