"use strict";
// This plugin will open a window to prompt the user to enter a number, and
// it will then create that many rectangles on the screen.
// This file holds the main code for plugins. Code in this file has access to
// the *figma document* via the figma global object.
// You can access browser APIs in the <script> tag inside "ui.html" which has a
// full browser environment (See https://www.figma.com/plugin-docs/how-plugins-run).
// This shows the HTML page in "ui.html".
figma.showUI(__html__);
// Calls to "parent.postMessage" from within the HTML page will trigger this
// callback. The callback will be passed the "pluginMessage" property of the
// posted message.
figma.ui.onmessage = msg => {
    // One way of distinguishing between different types of messages sent from
    // your HTML page is to use an object with a "type" property like this.
    if (msg.type === 'create-variables') {
        // https://utopia.fyi/space/calculator/?c=320,18,1.2,1440,20,1.25,5,2,1440-768-2560&s=0.66|0.22,1.2|4|5,s-l&g=m,l,xl,10
        const url = msg.url;
        // parse base values and assign variables
        let baseStart = (url.indexOf("c=") + 2);
        let baseEnd = (url.indexOf("s=") - 1);
        const baseValueString = url.slice(baseStart, baseEnd);
        const baseValueArray = baseValueString.split(",");
        const minWidth = baseValueArray[0]; // 320
        const minFontSize = baseValueArray[1]; // 18
        const maxWidth = baseValueArray[3]; // 1440
        const maxFontSize = baseValueArray[4]; // 20
        const modeArray = baseValueArray[8].split('-'); // ["1440", "768", "2560"]
        // parse multipliers into 2 arrays and assign variables
        let multiplierStart = (url.indexOf("s=") + 3);
        let multiplierEnd = (url.indexOf("g=") - 5);
        const multiplierValueString = url.slice(multiplierStart, multiplierEnd); // [0.66|0.22,1.2|4|5]
        const multiplierValueArray = multiplierValueString.split(","); // [0.66|0.22], [1.2|4|5]
        const negArray = multiplierValueArray[0].split('|'); // [0.66], [0.22]
        const posArray = multiplierValueArray[1].split('|');
        function negSizeLookup(napple) {
            // gets string name of root spacer size from negArray[napple]
            if (napple !== 0) {
                let snapple = napple++;
                let strapon = snapple;
                return strapon.concat('xs');
            }
            else {
                return 'xs';
            }
        }
        function posSizeLookup(napple) {
            // gets string name of root spacer size from posArray[napple]
            if (napple === 0) {
                return 'm';
            }
            else if (napple === 1) {
                return 'l';
            }
            else if (napple === 2) {
                return 'xl';
            }
            else {
                let snapple = napple++;
                let strapon = snapple;
                return strapon.concat('xl');
            }
        }
        // check if collection already exists
        let collectionExists = false;
        const allCollections = figma.variables.getLocalVariableCollections();
        let existingCollection = "";
        for (let i = 0; i < allCollections.length; i++) {
            if (allCollections[i].name === 'Utopia Spacers') {
                collectionExists = true;
                existingCollection = allCollections[i].id;
            }
        }
        // if it doesn't exist, creates Figma Variables collection
        let newCollection = '';
        if (collectionExists === false) {
            let newCollection = figma.variables.createVariableCollection('Utopia Spacers');
            for (let i = 1; i < modeArray.length; i++) { //add modes from modeArray except first mode
                console.log(newCollection);
                newCollection.addMode(modeArray[i]);
            }
            newCollection.renameMode(newCollection.modes[0].modeId, modeArray[0]); //renames first mode (Mode 1) to first modeArray item name
        }
        //creates collection variable depending on whether existing or not
        let utopiaCollection = '';
        if (collectionExists = false) {
            let utopiaCollection = figma.variables.getVariableCollectionById(existingCollection);
        }
        else {
            let utopiaCollection = newCollection;
        }
        // //create variables for each mode if they exist
        // let modeId1 = '';
        // if (typeof utopiaCollection.modes[0] !== 'undefined') {
        //   modeId1 = utopiaCollection.modes[0].modeId;
        // }
        // let modeId2 = '';
        // if (typeof utopiaCollection!.modes[1] !== 'undefined') {
        //   modeId2 = utopiaCollection!.modes[1].modeId;
        // }
        // let modeId3 = '';
        // if (typeof utopiaCollection!.modes[2] !== 'undefined') {
        //   modeId3 = utopiaCollection!.modes[2].modeId;
        // }
        // let modeId4 = '';
        // if (typeof utopiaCollection!.modes[3] !== 'undefined') {
        //   modeId4 = utopiaCollection!.modes[3].modeId;
        // }
        // UNFINISHED FROM HERE ON ——————————————————————————————————————————————————————
        // Utopia root system variables and math
        // Array that holds modes (either from UI or from URL)
        const uiModes = [390, 500, 1440, 2560];
        const rootValues = [];
        const masterArray = [];
        for (let i = 0; i > uiModes.length; i++) {
            let fluidBp = (uiModes[i] - minWidth) / (maxWidth - minWidth);
        }
        function getRootValues(baseValue, negArray, posArray) {
            for (let i = 0; i > negArray.length; i++) {
                rootValues.push({
                    name: negSizeLookup(i),
                    value: baseValue * i
                });
            }
        }
        getRootValues(minFontSize, negArray, posArray);
        console.log(rootValues);
        function createVariables(compSize) {
            let fluidBp = (compSize - minWidth) / (maxWidth - minWidth);
        }
        //TODO: create 2 for loops, one for neg one for pos, that create step size variables
        // let _2xs_min = minFontSize * negArray[1];
        // let _2xs_max = maxFontSize * negArray[1];
        // let _xs_min = minFontSize * negArray[0];
        // let _xs_max = maxFontSize * negArray[0];
        // let _s_min = minFontSize;
        // let _s_max = maxFontSize;
        // let _m_min = minFontSize * posArray[0];
        // let _m_max = maxFontSize * posArray[0];
        // let _l_min = minFontSize * posArray[1];
        // let _l_max = maxFontSize * posArray[1];
        // let _xl_min = minFontSize * posArray[2];
        // let _xl_max = maxFontSize * posArray[2];
        // let _2xl_min = minFontSize * posArray[3];
        // let _2xl_max = maxFontSize * posArray[3];
        // let _3xl_min = minFontSize * posArray[4];
        // let _3xl_max = maxFontSize * posArray[4];
        // step sizes
        // let _2xs_xs = _2xs_min + (_xs_max - _2xs_min) * fluidBp;
        // let _xs_s = _xs_min + (_s_max - _xs_min) * fluidBp;
        // let _2xs_xs = _2xs_min + (_xs_max - _2xs_min) * fluidBp;
        // let _xs_s = _xs_min + (_s_max - _xs_min) * fluidBp;
        //  // check for duplicate variables
        //   const localVariables = figma.variables.getLocalVariables('FLOAT');
        //   for (let i = 0; i < localVariables.length; i++) {
        //     if (localVariables[i].name !== 'Test') {
        //     }
        //   }
        //  console.log(localVariables);
        //   // create Figma Variables 
        //   for (let i = 0; i < localVariables.length; i++) {
        //     let testVariable = '';
        //     if (localVariables[i].name !== 'Test') {
        //       let testVariable = figma.variables.createVariable(
        //         'Test',
        //         utopiaCollection!.id,
        //         'FLOAT'
        //       );
        //       testVariable.setValueForMode(modeId1, minFontSize);
        //       testVariable.setVariableCodeSyntax('WEB', '--spacer-s-m');
        //     }
        //   }
        // Make sure to close the plugin when you're done. Otherwise the plugin will
        // keep running, which shows the cancel button at the bottom of the screen.
        //figma.closePlugin();
    }
};
