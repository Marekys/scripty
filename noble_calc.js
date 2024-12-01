/*
 * Script Name: Nobles Resource Calculator
 * Version: v1.0
 * Last Updated: 2021-08-05
 * Author: RedAlert
 * Author URL: https://twscripts.dev/
 * Author Contact: redalert_tw (Discord)
 * Approved: N/A
 * Approved Date: 2021-08-28
 * Mod: JawJaw
 */

/*--------------------------------------------------------------------------------------
 * This script can NOT be cloned and modified without permission from the script author.
 --------------------------------------------------------------------------------------*/

// User Input
if (typeof DEBUG !== 'boolean') DEBUG = false;

// Script Config
var scriptConfig = {
    scriptData: {
        prefix: 'nobleCalculator',
        name: 'Nobles Resource Calculator',
        version: 'v1.0',
        author: 'RedAlert',
        authorUrl: 'https://twscripts.dev/',
        helpLink:
            'https://forum.tribalwars.net/index.php?threads/nobles-resources-calculator.287583/',
    },
    translations: {
        en_DK: {
            'Nobles Resource Calculator': 'Kalkulacka na Vypocet Slachticov',
            Help: 'Help',
            'Redirecting...': 'Redirecting...',
            'Enter the nobleman amount for the which you want to calculate resources':
                'Zadaj pocet slachticov pre ktory chces vypocitat zdroje',
            'Calculate Resources': 'Vypocitaj Suroviny',
            Coins: 'Mince',
            Nobles: 'Slachtici',
            Wood: 'Drevo',
            Clay: 'Hlina',
            Iron: 'Zelezo',
            TOTAL: 'TOTAL',
            'Invalid nobles amount!': 'Nevalidny pocet slachticov!',
            'Enter custom coin % sale value (0-48)':
                'Zadaj vlastnu hodnotu zlacnenia mince (0-48)',
            'Custom coin sale value must be between 0 and 48':
                'Hodnota zlavnenej mince musi byt medzi 0 a 48',
            'Enter the number of coins you already have':
                'Zadaj pocet minci ktore uz su vyrazene',
        },
    },
    allowedMarkets: [],
    allowedScreens: ['snob'],
    allowedModes: [],
    isDebug: DEBUG,
    enableCountApi: true,
};

$.getScript(
    `https://twscripts.dev/scripts/twSDK.js?url=${document.currentScript.src}`,
    async function () {
        // Initialize Library
        await twSDK.init(scriptConfig);
        const scriptInfo = twSDK.scriptInfo();
        const isValidScreen = twSDK.checkValidLocation('screen');

        if (isValidScreen) {
            const noblesAmount = 4; // default nobles amount

            const nobleCost = BuildingSnob.Modes.train.next_snob;
            const coinCost = BuildingSnob.Modes.train.storage_item;
            const customCoinSale = 10;

            const content = prepareContent(noblesAmount, nobleCost, coinCost);

            const customStyle = `
                .ra-grid { display: grid; grid-template-columns: 1fr 3fr; grid-gap: 15px; }
                .ra-input { padding: 3px; font-size: 14px; }
                .ra-table-v2 { border-spacing: 2px !important; border-collapse: separate !important; }
            `;

            twSDK.renderBoxWidget(
                content,
                'raNobleCalculator',
                'ra-tribe-calculator',
                customStyle
            );

            // register action handlers
            onClickCalculateNobles(nobleCost, coinCost);
        } else {
            UI.InfoMessage(twSDK.tt('Redirecting...'));
            twSDK.redirectTo('snob');
        }

        // Action Handler: Handle click
        function onClickCalculateNobles(nobleCost, coinCost) {
            jQuery('#raCalculateResourcesBtn').on('click', function (e) {
                e.preventDefault();

                const noblesAmount = parseInt(jQuery('#raNoblesAmount').val());
                const customCoinSale = parseFloat(jQuery('#raCustomCoinSale').val());
                const hisCoins = parseInt(jQuery('#raHisCoins').val()) || 0;

                if (isNaN(noblesAmount) || noblesAmount <= 0) {
                    UI.ErrorMessage(twSDK.tt('Invalid nobles amount!'));
                    return;
                }

                if (isNaN(customCoinSale) || customCoinSale < 0 || customCoinSale > 48) {
                    UI.ErrorMessage(twSDK.tt('Custom coin sale value must be between 0 and 48'));
                    return;
                }

                const adjustedCoinCost = {
                    wood: coinCost.wood * (1 - customCoinSale / 100),
                    stone: coinCost.stone * (1 - customCoinSale / 100),
                    iron: coinCost.iron * (1 - customCoinSale / 100)
                };

                let coinsNeeded = twSDK.calculateCoinsNeededForNthNoble(noblesAmount);
                coinsNeeded = Math.max(0, coinsNeeded - hisCoins);

                const { woodNeededCoins, stoneNeededCoins, ironNeededCoins } =
                    calculateResourcesForCoins(coinsNeeded, adjustedCoinCost);
                const {
                    woodNeededNobles,
                    stoneNeededNobles,
                    ironNeededNobles,
                } = calculateResourcesForNobles(noblesAmount, nobleCost);

                const totalWood = woodNeededCoins + woodNeededNobles;
                const totalStone = stoneNeededCoins + stoneNeededNobles;
                const totalIron = ironNeededCoins + ironNeededNobles;

                jQuery('#raCoinsAmount').text(twSDK.formatAsNumber(coinsNeeded));
                jQuery('#raWoodNeededCoins').text(twSDK.formatAsNumber(woodNeededCoins));
                jQuery('#raStoneNeededCoins').text(twSDK.formatAsNumber(stoneNeededCoins));
                jQuery('#raIronNeededCoins').text(twSDK.formatAsNumber(ironNeededCoins));

                jQuery('#raWoodNeededNobles').text(twSDK.formatAsNumber(woodNeededNobles));
                jQuery('#raStoneNeededNobles').text(twSDK.formatAsNumber(stoneNeededNobles));
                jQuery('#raIronNeededNobles').text(twSDK.formatAsNumber(ironNeededNobles));

                jQuery('#raTotalWood').text(twSDK.formatAsNumber(totalWood));
                jQuery('#raToolStone').text(twSDK.formatAsNumber(totalStone));
                jQuery('#raTotalIron').text(twSDK.formatAsNumber(totalIron));
            });
        }

        // Update the prepareContent function to include the new input field
        function prepareContent(noblesAmount, nobleCost, coinCost) {
            const coinsNeeded = twSDK.calculateCoinsNeededForNthNoble(noblesAmount);

            const { woodNeededCoins, stoneNeededCoins, ironNeededCoins } =
                calculateResourcesForCoins(coinsNeeded, coinCost);
            const { woodNeededNobles, stoneNeededNobles, ironNeededNobles } =
                calculateResourcesForNobles(noblesAmount, nobleCost);

            const totalWood = woodNeededCoins + woodNeededNobles;
            const totalStone = stoneNeededCoins + stoneNeededNobles;
            const totalIron = ironNeededCoins + ironNeededNobles;

            return `
                <div class="ra-grid">    
                    <div>
                        <div class="ra-mb15">
                            <label for="raNoblesAmount">
                                ${twSDK.tt(
                                    'Enter the nobleman amount for the which you want to calculate resources'
                                )}
                            </label>
                            <input class="ra-input" id="raNoblesAmount" type="text" value="${noblesAmount}">
                        </div>
                        <div class="ra-mb15">
                            <label for="raCustomCoinSale">
                                ${twSDK.tt('Enter custom coin sale value (0-48)')}
                            </label>
                            <input class="ra-input" id="raCustomCoinSale" type="number" value="0" min="0" max="48">
                        </div>
                        <div class="ra-mb15">
                            <label for="raHisCoins">
                                ${twSDK.tt('Enter the number of coins you already have')}
                            </label>
                            <input class="ra-input" id="raHisCoins" type="number" value="0" min="0">
                        </div>
                        <a class="btn" href="javascript:void(0)" id="raCalculateResourcesBtn">
                            ${twSDK.tt('Calculate Resources')}
                        </a>
                    </div>
                    <div>
                        <table class="ra-table ra-table-v2" width="100%">
                            <thead>
                                <tr>
                                    <th class="ra-tal" width="20%"></th>
                                    <th><span class="icon header wood"></span> ${twSDK.tt(
                                        'Wood'
                                    )}</th>
                                    <th><span class="icon header stone"></span> ${twSDK.tt(
                                        'Clay'
                                    )}</th>
                                    <th><span class="icon header iron"></span> ${twSDK.tt(
                                        'Iron'
                                    )}</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td class="ra-tal" width="20%">
                                        <b>${twSDK.tt(
                                            'Coins'
                                        )} <span id="raCoinsAmount">${twSDK.formatAsNumber(
                coinsNeeded
            )}</span></b>
                                    </td>
                                    <td id="raWoodNeededCoins">${twSDK.formatAsNumber(
                                        woodNeededCoins
                                    )}</td>
                                    <td id="raStoneNeededCoins">${twSDK.formatAsNumber(
                                        stoneNeededCoins
                                    )}</td>
                                    <td id="raIronNeededCoins">${twSDK.formatAsNumber(
                                        ironNeededCoins
                                    )}</td>
                                </tr>
                                <tr>
                                    <td class="ra-tal" width="20%">
                                        <b>${twSDK.tt('Nobles')}</b>
                                    </td>
                                    <td id="raWoodNeededNobles">${twSDK.formatAsNumber(
                                        woodNeededNobles
                                    )}</td>
                                    <td id="raStoneNeededNobles">${twSDK.formatAsNumber(
                                        stoneNeededNobles
                                    )}</td>
                                    <td id="raIronNeededNobles">${twSDK.formatAsNumber(
                                        ironNeededNobles
                                    )}</td>
                                </tr>
                                <tr>
                                    <td class="ra-tal" width="20%">
                                        <b>${twSDK.tt('TOTAL')}</b>
                                    </td>
                                    <td id="raTotalWood">${twSDK.formatAsNumber(
                                        totalWood
                                    )}</td>
                                    <td id="raToolStone">${twSDK.formatAsNumber(
                                        totalStone
                                    )}</td>
                                    <td id="raTotalIron">${twSDK.formatAsNumber(
                                        totalIron
                                    )}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            `;
        }

        // Helper: Calculate resources needed to mint n coins
        function calculateResourcesForCoins(coinsAmount, coinsCost) {
            const { wood, stone, iron } = coinsCost;
            const woodNeededCoins = wood * coinsAmount;
            const stoneNeededCoins = stone * coinsAmount;
            const ironNeededCoins = iron * coinsAmount;

            return { woodNeededCoins, stoneNeededCoins, ironNeededCoins };
        }

        // Helper: Calculate resources needed to educate n nobles
        function calculateResourcesForNobles(noblesAmount, noblesCost) {
            const { wood, stone, iron } = noblesCost;
            const woodNeededNobles = wood * noblesAmount;
            const stoneNeededNobles = stone * noblesAmount;
            const ironNeededNobles = iron * noblesAmount;
            return { woodNeededNobles, stoneNeededNobles, ironNeededNobles };
        }
    }
);