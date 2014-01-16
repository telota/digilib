/*
 * #%L
 * digilib measure plugin
 * %%
 * Copyright (C) 2012 - 2014 Bibliotheca Hertziana, MPIWG Berlin
 * %%
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as 
 * published by the Free Software Foundation, either version 3 of the 
 * License, or (at your option) any later version.
 * 
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Lesser Public License for more details.
 * 
 * You should have received a copy of the GNU General Lesser Public 
 * License along with this program.  If not, see
 * <http://www.gnu.org/licenses/lgpl-3.0.html>.
 * #L%
 * Authors: Martin Raspe, Robert Casties, 2012-2014
 */
/**
 * digilib measure plugin (measure distances on the digilib image in historic units etc.)
**/ 

/* jslint browser: true, debug: true, forin: true
*/

(function($) {

    // the digilib object
    var digilib = null;
    // the normal zoom area
    var FULL_AREA = null;

    // the functions made available by digilib
    var fn = {
        // dummy function to avoid errors, gets overwritten by buttons plugin
        highlightButtons : function () {
            console.debug('svg: dummy function - highlightButtons');
            }
        };
    // affine geometry plugin
    var geom = null;
    // convenience variable, set in init()
    var CSS = '';

    var UNITS = {
        "comment" : [
          "Angaben nach:",
          "Klimpert, Richard: Lexikon der Münzen, Maße, Gewichte, Zählarten und Zeitgrößen aller Länder der Erde 2) Berlin 1896 (Reprint Graz 1972)",
          "Doursther, Horace: Dictionnaire universel des poids et mesures anciens et modernes. Paris 1840 (Reprint Amsterdam 1965)"
          ],
        "sections" : [{
            "name"  : "Längenmaße: metrisch",
            "group" : "1",
            "units" : [{
				"name" : "m",
				"factor" : "1"
				},
				{
				"name" : "mm",
				"factor" : "0.001"
				},
				{
				"name" : "cm",
				"factor" : "0.01"
				},
				{
				"name" : "dm",
				"factor" : "0.1"
				},
				{
				"name" : "km",
				"factor" : "1000"
				}]
            },
            {
            "name"  : "Längenmaße: nautisch",
            "group" : "1",
            "units" : [{
				"name" : "geographische Meile",
				"factor" : "7420"
				},
				{
				"name" : "Seemeile",
				"factor" : "1854.965"
				},
				{
				"name" : "fathom",
				"factor" : "1.828782"
				},
				{
				"name" : "cable",
				"factor" : "182.8782"
				},
				{
				"name" : "league",
				"factor" : "5564.895"
				}]
            },
            {
            "name"  : "Längenmaße: England",
            "group" : "1",
            "units" : [{
				"name" : "foot",
				"factor" : "0.304797",
				"subunits" : "12"
				},
				{
				"name" : "inch",
				"factor" : "0.02539975"
				},
				{
				"name" : "yard",
				"factor" : "0.914391",
				"subunits" : "3"
				},
				{
				"name" : "pole",
				"factor" : "5.0291505",
				"subunits" : "11"
				},
				{
				"name" : "chain",
				"factor" : "20.116602",
				"subunits" : "4"
				},
				{
				"name" : "furlong",
				"factor" : "201.16602"
				},
				{
				"name" : "mile",
				"factor" : "1609.32816",
				"subunits" : "8"
				}]
            },
            {
            "name"  : "Längenmaße: Italien",
            "group" : "1",
            "units" : [{
				"name" : "palmo d'architetto (Rom)",
				"factor" : "0.223425",
				"subunits" : "12"
				},
				{
				"name" : "braccio (Florenz)",
				"factor" : "0.5836"
				},
				{
				"name" : "braccio (Mailand)",
				"factor" : "0.5949"
				},
				{
				"name" : "canna d'architetto (Rom)",
				"factor" : "2.23425"
				},
				{
				"name" : "canna di commercio (Rom)",
				"factor" : "1.9920"
				},
				{
				"name" : "canna d'architetto (Florenz)",
				"factor" : "2.9180"
				},
				{
				"name" : "canna di commercio (Florenz)",
				"factor" : "2.3344"
				},
				{
				"name" : "canna (Neapel)",
				"factor" : "2.0961"
				},
				{
				"name" : "miglio (Lombardei)",
				"factor" : "1784.808"
				},
				{
				"name" : "miglio (Neapel)",
				"factor" : "1855.110"
				},
				{
				"name" : "miglio (Rom)",
				"factor" : "1489.50"
				},
				{
				"name" : "minuta (Rom)",
				"factor" : "0.00372375"
				},
				{
				"name" : "oncia (Rom)",
				"factor" : "0.01861875"
				},
				{
				"name" : "oncia (Mailand)",
				"factor" : "0.49575"
				},
				{
				"name" : "palmo di commercio (Rom)",
				"factor" : "0.249"
				},
				{
				"name" : "palmo (Florenz)",
				"factor" : "0.2918"
				},
				{
				"name" : "piede (Brescia)",
				"factor" : "0.471"
				},
				{
				"name" : "piede (Carrara)",
				"factor" : "0.2933"
				},
				{
				"name" : "piede (Como)",
				"factor" : "0.4512"
				},
				{
				"name" : "piede (Modena)",
				"factor" : "0.523048"
				},
				{
				"name" : "piede (Reggio Em.)",
				"factor" : "0.530898"
				},
				{
				"name" : "piede (Venedig)",
				"factor" : "0.347735"
				},
				{
				"name" : "piede (Vicenza)",
				"factor" : "0.3574"
				},
				{
				"name" : "piede (Verona)",
				"factor" : "0.3429"
				},
				{
				"name" : "piede (Rom)",
				"factor" : "0.297587"
				},
				{
				"name" : "piede Lombardo",
				"factor" : "0.435185"
				},
				{
				"name" : "piede liprando (Turin)",
				"factor" : "0.51377"
				},
				{
				"name" : "piede manuale (Turin)",
				"factor" : "0.342511"
				},
				{
				"name" : "piede (Neapel, 'palmo')",
				"factor" : "0.26455"
				},
				{
				"name" : "soldo (Florenz)",
				"factor" : "0.2918"
				},
				{
				"name" : "trabucco piemontese (Turin)",
				"factor" : "3.08259"
				}]
            },
            {
            "name"  : "Längenmaße: Niederlande",
            "group" : "1",
            "units" : [{
				"name" : "voet (Amsterdam)",
				"factor" : "0.283113"
				},
				{
				"name" : "voet (Antwerpen)",
				"factor" : "0.2868"
				},
				{
				"name" : "voet (Aelst)",
				"factor" : "0.2772"
				},
				{
				"name" : "voet (Breda)",
				"factor" : "0.28413"
				},
				{
				"name" : "voet (Brügge)",
				"factor" : "0.27439"
				},
				{
				"name" : "voet (Brüssel)",
				"factor" : "0.2757503"
				},
				{
				"name" : "voet (Groningen)",
				"factor" : "0.2922"
				},
				{
				"name" : "voet (Haarlem)",
				"factor" : "0.2858"
				},
				{
				"name" : "voet (Kortrijk)",
				"factor" : "0.2977"
				},
				{
				"name" : "voet (Tournai)",
				"factor" : "0.2977"
				},
				{
				"name" : "voet (Utrecht)",
				"factor" : "0.2683"
				},
				{
				"name" : "voet (Ypern)",
				"factor" : "0.2739"
				},
				{
				"name" : "pied (Hainaut)",
				"factor" : "0.2934"
				},
				{
				"name" : "pied St. Hubert (Lüttich)",
				"factor" : "0.294698"
				},
				{
				"name" : "pied St. Lambert (Lüttich)",
				"factor" : "0.291796"
				},
				{
				"name" : "pied Ste. Gertrude (Nivelles)",
				"factor" : "0.27709"
				},
				{
				"name" : "steenvoet (Oudenaerde)",
				"factor" : "0.2977"
				},
				{
				"name" : "houtvoet (Oudenaerde)",
				"factor" : "0.292"
				}]
            },
            {
            "name"  : "Längenmaße: Frankreich",
            "group" : "1",
            "units" : [{
				"name" : "pied du Roi (Paris)",
				"factor" : "0.32483938497"
				},
				{
				"name" : "pied (Arras)",
				"factor" : "0.29777"
				},
				{
				"name" : "pied (Cambrai)",
				"factor" : "0.29777"
				},
				{
				"name" : "Burgundischer Fuß",
				"factor" : "0.33212"
				}]
            },
            {
            "name"  : "Längenmaße: Südeuropa",
            "group" : "1",
            "units" : [{
				"name" : "pié de Burgos (Spanien)",
				"factor" : "0.278635"
				},
				{
				"name" : "pé (Portugal)",
				"factor" : "0.33"
				}]
            },
            {
            "name"  : "Längenmaße: deutschspr. Länder",
            "group" : "1",
            "units" : [{
				"name" : "Fuß (Basel)",
				"factor" : "0.29820"
				},
				{
				"name" : "Fuß (Bayern)",
				"factor" : "0.2918592"
				},
				{
				"name" : "Fuß (Braunschweig)",
				"factor" : "0.2853624"
				},
				{
				"name" : "Fuß (Gotha)",
				"factor" : "0.287622"
				},
				{
				"name" : "Fuß (Hamburg)",
				"factor" : "0.286575"
				},
				{
				"name" : "Fuß (Hessen)",
				"factor" : "0.287669"
				},
				{
				"name" : "Fuß (Köln)",
				"factor" : "0.2876"
				},
				{
				"name" : "Fuß (Mecklenburg)",
				"factor" : "0.291006"
				},
				{
				"name" : "Fuß (Münster)",
				"factor" : "0.2908"
				},
				{
				"name" : "Fuß (Pommern)",
				"factor" : "0.2921"
				},
				{
				"name" : "Fuß (rheinisch)",
				"factor" : "0.3138535"
				},
				{
				"name" : "Fuß (Sachsen)",
				"factor" : "0.2831901"
				},
				{
				"name" : "Fuß (Preußen)",
				"factor" : "0.3138535"
				},
				{
				"name" : "Fuß (Wien)",
				"factor" : "0.3180807"
				},
				{
				"name" : "Fuß (Württemberg)",
				"factor" : "0.2864903"
				},
				{
				"name" : "Werkschuh (Frankfurt)",
				"factor" : "0.2846143"
				},
				{
				"name" : "Meile (Preußen)",
				"factor" : "7532.485"
				},
				{
				"name" : "Postmeile (Österreich)",
				"factor" : "7585.937"
				},
				{
				"name" : "Dezimalfuß (Preußen)",
				"factor" : "0.3766242"
				}]
            },
            {
            "name"  : "Längenmaße: Osteuropa",
            "group" : "1",
            "units" : [{
				"name" : "Fuß (Böhmen)",
				"factor" : "0.2964"
				},
				{
				"name" : "Fuß (Mähren)",
				"factor" : "0.29596"
				},
				{
				"name" : "stopa (Krakauer Fuß)",
				"factor" : "0.3564"
				},
				{
				"name" : "stopa (Warschauer Fuß)",
				"factor" : "0.288"
				},
				{
				"name" : "Fuß (Rußland)",
				"factor" : "0.3556"
				},
				{
				"name" : "arschin",
				"factor" : "0.7112"
				},
				{
				"name" : "saschen (Faden)",
				"factor" : "2.133"
				},
				{
				"name" : "werst",
				"factor" : "1066.8"
				},
				{
				"name" : "milja",
				"factor" : "7468"
				}]
            },
            {
            "name"  : "Längenmaße: Antike",
            "group" : "1",
            "units" : [{
				"name" : "pes romanus",
				"factor" : "0.2945"
				},
				{
				"name" : "pollex (Zoll)",
				"factor" : "0.0245416667"
				},
				{
				"name" : "digitus (Fingerbreite)",
				"factor" : "0.01840625"
				},
				{
				"name" : "palmus (Handbreite)",
				"factor" : "0.073625"
				},
				{
				"name" : "cubitus (Elle)",
				"factor" : "0.44175"
				},
				{
				"name" : "passus (Doppelschritt)",
				"factor" : "1.4725"
				},
				{
				"name" : "pertica",
				"factor" : "2.945"
				},
				{
				"name" : "actus",
				"factor" : "35.34"
				},
				{
				"name" : "mille passus (Meile)",
				"factor" : "1472.5"
				},
				{
				"name" : "stadium (600 Fuß)",
				"factor" : "176.7"
				},
				{
				"name" : "stadium (1/8 Meile)",
				"factor" : "184.0625"
				},
				{
				"name" : "stadion (Olympia)",
				"factor" : "192.25"
				},
				{
				"name" : "Fuß (attisch)",
				"factor" : "0.308"
				},
				{
				"name" : "Fuß (Babylon)",
				"factor" : "0.35"
				},
				{
				"name" : "Fuß (Delphi)",
				"factor" : "0.1848"
				},
				{
				"name" : "Fuß (Olympia)",
				"factor" : "0.32041667"
				}]
            },
            {
            "name"  : "Fläche",
            "group" : "4",
            "units" : [{
				"name" : "qm",
				"factor" : "1"
				},
				{
				"name" : "qmm",
				"factor" : "0.000001"
				},
				{
				"name" : "qcm",
				"factor" : "0.0001"
				},
				{
				"name" : "qdm",
				"factor" : "0.01"
				},
				{
				"name" : "Ar",
				"factor" : "100"
				},
				{
				"name" : "Morgen",
				"factor" : "2500"
				},
				{
				"name" : "Hektar",
				"factor" : "10000"
				},
				{
				"name" : "qkm",
				"factor" : "1000000"
				},
				{
				"name" : "square inch",
				"factor" : "0.0006452"
				},
				{
				"name" : "square foot",
				"factor" : "0.09288"
				},
				{
				"name" : "square yard",
				"factor" : "0.836",
				"subunits" : "9"
				},
				{
				"name" : "pole (rod, perch)",
				"factor" : "25.289"
				},
				{
				"name" : "rood",
				"factor" : "1012",
				"subunits" : "40"
				},
				{
				"name" : "acre",
				"factor" : "4048",
				"subunits" : "4"
				},
				{
				"name" : "square mile",
				"factor" : "2590000"
				}]
            },
            {
            "name"  : "Sonstige",
            "group" : "0",
            "units" : [{
				"name" : "Maßstab 1:200",
				"factor" : "200"
				},
				{
				"name" : "Maßstab",
				"factor" : "1:100",
				"add" : "100"
				},
				{
				"name" : "Maßstab 1:75",
				"factor" : "75"
				},
				{
				"name" : "Maßstab 1:60",
				"factor" : "60"
				},
				{
				"name" : "Maßstab",
				"factor" : "1:50",
				"add" : "50"
				},
				{
				"name" : "Maßstab 1:25",
				"factor" : "25"
				},
				{
				"name" : "Maßstab 1:20",
				"factor" : "20"
				},
				{
				"name" : "Maßstab 1:10",
				"factor" : "10"
				},
				{
				"name" : "Maßstab 1:5",
				"factor" : "5"
				},
				{
				"name" : "Maßstab 1:3",
				"factor" : "3"
				}]
          }]
        };
    var buttons = {
        showtoolbar : {
            onclick : "showtoolbar",
            tooltip : "show toolbar",
            icon : "showregions.png"
            },
        drawshape : {
            onclick : "drawshape",
            tooltip : "draw a shape",
            }
        };

    var defaults = {
        // buttonset of this plugin
        measureButtonSet : ['showtoolbar'],
        // unit data
        units : UNITS,
        // choice of colors offered by toolbar
        lineColors : ['white', 'red', 'orange', 'yellow', 'green', 'cyan', 'blue', 'violet', 'black'],
        // default color
        lineColor : 'red',
        // color while the line is drawn
        drawColor : 'green',
        // color of selected objects
        selectColor : 'red',
        // drawing shapes
        shapetypes : [
            { 'name': 'line', 'type' : 'Line' },
            { 'name': 'polyline', 'type' : 'Polygon' },
            { 'name': 'rectangle', 'type' : 'Rectangle' },
            { 'name': 'square', 'type' : 'Square' },
            { 'name': 'circle', 'type' : 'Circle' },
            { 'name': 'arch', 'type' : 'Arch' },
            { 'name': 'ratio', 'type' : 'Ratio' },
            { 'name': 'intercolumnium', 'type' : 'InterCol' },
            { 'name': 'line grid', 'type' : 'Grid' }
            ],
        // default shape
        shape : 'line',
        // measuring unit (index into unit list)
        unit : 1,
        // converted unit (index into unit list)
        converted : 2,
        // last measured distance 
        lastDistance : 0,
        // last measured angle 
        lastAngle : 0,
        // maximal denominator for mixed fractions
        maxDenominator : 20,
        // number of decimal places for convert results
        maxDecimals : 3,
        // show convert result as mixed fraction?
        showMixedFraction : false,
        // show angle relative to last line?
        showRelativeAngle : false,
        // show distance numbers?
        showDistanceNumbers : true,
        // show ratio of rectangle sides?
        showRectangleRatios : false,
        // draw line ends as small crosses
        drawEndPoints : true,
        // draw mid points of lines
        drawMidPoints : false,
        // draw circle centers
        drawCenters : false,
        // draw rectangles from the diagonal and one point
        drawFromDiagonal : false,
        // draw circles from center
        drawFromCenter : false,
        // snap to endpoints
        snapEndPoints : false,
        // snap to mid points of lines
        snapMidPoints : false,
        // snap to circle centers
        snapCenters : false,
        // snap distance (in screen pixels)
        snapDistance : 5,
        // keep original object when moving/scaling/rotating
        keepOriginal : false,
        // number of copies when drawing grids
        gridCopies : 10
        };

    var actions = {
        showtoolbar : function(data) {
            var $toolbar = data.$toolbar;
            if (!$toolbar) {
                $toolbar = setupToolbar(data);
				};
			$toolbar.toggle();
            setScreenPosition(data, $toolbar);
			return;
            },
        drawshape : function(data) {
            var shape = currentShape(data);
            digilib.actions.addShape(data, shape, onCompleteShape);
            console.debug('action: drawshape', shape);
            }
        };

    var onCompleteShape = function(data, shape) {
            console.debug('onCompleteShape', shape);
        };

    var currentShape = function(data) {
        var shape = getSelectedShapeType(data);
        var stroke = getSelectedStroke(data);
        var item = {
            'geometry' : {
                'type' : shape.type
                },
            'properties' : {
                'stroke' : stroke
                }
            };
        return item;
        };

    // return shape type selected by user (on the toolbar)
    var getSelectedShapeType = function(data) {
        var $t = data.$toolbar;
        var $select = $t.find('#measure-shapes');
        var val = $select.val();
        return data.settings.shapetypes[val];
    };

    // return line color chosen by user
    var getSelectedStroke = function(data) {
        // TODO: colorpicker
        return data.settings.linecolor;
    };

    // load shapes into select element
    var loadShapeTypes = function(data) {
        var $t = data.$toolbar;
        var $shape = $t.find('#measure-shapes');
        $.each(data.settings.shapetypes, function(index, item) {
            var $opt = $('<option value="'+ index + '">' + item.name + '</option>');
            $shape.append($opt);
            });
    };

    // load units into select elements
    var loadSections = function(data) {
        var $t = data.$toolbar;
        var $unit1 = $t.find('#measure-unit1');
        var $unit2 = $t.find('#measure-unit2');
        var sections = data.settings.units.sections;
        $.each(sections, function(index, section) {
            var $opt = $('<option class="dl-section" disabled="disabled">'+ section.name +'</option>');
            $unit1.append($opt);
            $unit2.append($opt.clone());
            $.each(section.units, function(index, unit) {
				var $opt = $('<option class="dl-units" value="'+ unit.factor + '">'+ unit.name + '</option>');
				$opt.data('unit', unit);
				$unit1.append($opt);
				$unit2.append($opt.clone());
				});
            });
    };

    var setScreenPosition = function(data, $div) {
        if ($div == null) return;
        var h = geom.rectangle($div).height;
        var s = fn.getFullscreenRect(data);
        geom.position(0, s.height - h).adjustDiv($div);
    };

    // setup a div for accessing the measure functionality
    var setupToolbar = function(data) {
        console.debug('measure: setupToolbar');
        var html = '\
            <div id="measure-toolbar">\
                <button id="measure-draw">M</button>\
				<select id="measure-shapes"/>\
				<span class="dl-measure-label">pixel</span>\
				<span id="measure-pixel" class="measure-number">0.0</span>\
				<span class="dl-measure-label">factor</span>\
				<span id="measure-factor" class="dl-measure-number">0.0</span>\
				<input id="measure-value1" class="dl-measure-input" value="0.0"/>\
				<span class="measure-label">=</span>\
				<select id="measure-unit1"/>\
				<input id="measure-value2" class="dl-measure-input" value="0.0"/>\
				<span class="dl-measure-label">=</span>\
				<select id="measure-unit2"/>\
				<span id="measure-angle" class="dl-measure-number">0.0</span>\
            </div>';
        var $toolbar = $(html);
        console.debug('measure', data.$elem, $toolbar);
        data.$elem.append($toolbar);
        data.$toolbar = $toolbar;
        loadShapeTypes(data);
        loadSections(data);
        setupToolbarButton(data);
        return $toolbar;
        };

    // wire the draw button
    var setupToolbarButton = function (data) {
        console.debug('measure: setupToolbarButton');
        var $t = data.$toolbar;
        var $b = $t.find('#measure-draw');
        var buttonConfig = buttons['drawshape']; // not in data.settings.buttons
        // button properties
        var action = buttonConfig.onclick;
        var tooltip = buttonConfig.tooltip;
        $b.attr('title', tooltip);
        $elem = data.$elem;
        $b.on('click.digilib', function(evt) {
            // the handler function calls digilib with action
            console.debug('click action=', action, ' evt=', evt);
            $elem.digilib(action);
            return false;
            });
        };

    // event handler
    var handleSetup = function (evt) {
        console.debug("measure: handleSetup");
        var data = this;
        setupToolbar(data);
        // var settings = data.settings;
        };

    // event handler
    var handleUpdate = function (evt) {
        console.debug("measure: handleUpdate");
        // var data = this;
        // var settings = data.settings;
        };

    // additional buttons
    var installButtons = function (data) {
        var settings = data.settings;
        var mode = settings.interactionMode;
        var buttonSettings = settings.buttonSettings[mode];
        var buttonSet = settings.measureButtonSet;
        if (buttonSet.length && buttonSet.length > 0) {
            buttonSettings.measureButtonSet = buttonSet;
            buttonSettings.buttonSets.push('measureButtonSet');
            }
        };

    // plugin installation called by digilib on plugin object.
    var install = function (plugin) {
        digilib = plugin;
        if (digilib.plugins.vector == null) {
            console.debug('measure plugin: vector plugin is missing, aborting installation.');
            return;
            }
        console.debug('installing measure plugin. digilib:', digilib);
        fn = digilib.fn;
        // import geometry classes
        geom = fn.geometry;
        // add defaults, actions, buttons
        $.extend(true, digilib.defaults, defaults);
        $.extend(digilib.actions, actions);
        $.extend(true, digilib.buttons, buttons);
        // export functions
        // fn.test = test;
        };

    // plugin initialization
    var init = function (data) {
        console.debug('initialising measure plugin. data:', data);
        var settings = data.settings;
        CSS = settings.cssPrefix;
        FULL_AREA  = geom.rectangle(0, 0, 1, 1);
        // install event handlers
        var $data = $(data);
        $data.on('setup', handleSetup);
        $data.on('update', handleUpdate);
        // install region buttons if user defined regions are allowed
        if (digilib.plugins.buttons != null) {
            installButtons(data);
        }
        };

    // plugin object with name and init
    // shared objects filled by digilib on registration
    var pluginProperties = {
            name : 'measure',
            install : install,
            init : init,
            buttons : {},
            actions : {},
            fn : {},
            plugins : {}
        };

    if ($.fn.digilib == null) {
        $.error("jquery.digilib.measure must be loaded after jquery.digilib!");
    } else {
        $.fn.digilib('plugin', pluginProperties);
    }
})(jQuery);
