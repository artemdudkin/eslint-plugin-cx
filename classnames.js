/**
 * @fileoverview Control all jsx-elements' CSS class names
 *
 *   RULE : all CSS class names (1) should start with prefix__ or (2) should be equal to prefix
 *
 *   prefix = component name (camelCase, dashed or underscored)
 *   all modules should export component at 'export default' (and its name will be used as prefix)
 *   function components should be named functions
 *
 *   (tested only at ES6 classes + function components)
 *
 * @param {'prefixType':'<type>'} where <type> can be 'dash', 'camelCase' or 'underscore'
 *
 * @author Artem Dudkin
 */

'use strict';

var hasProp = require('jsx-ast-utils/hasProp');

let transform = {
   //camelCase to dashed (MyClass -> my-class)
  'dash'      : (str) => {return str.replace(/([A-Z])/g, function($1){return "-"+$1.toLowerCase();})
                                    .replace('-', '') // to remove first dash (as MyClass -> -my-class)
                }, 
   //dash to camelCase (my-class -> MyClass)
  'camelCase' : (str) => {let s = str.replace(/(\-[a-z])/g, function($1){return $1.toUpperCase().replace('-','');})
                          return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase(); //capitalize
                },
  //camelCase to underscore (MyClass -> my_class)
  'underscore': (str) => {return str.replace(/([A-Z])/g, function($1){return "_"+$1.toLowerCase();})
                                    .replace('_', '') // to remove first dash (as MyClass -> _my_class)
                }
}

// ------------------------------------------------------------------------------
// Rule Definition
// ------------------------------------------------------------------------------

module.exports = {
  meta: {
    docs: {
      description: 'Report wrong `className` props in jsx component',
      category: 'Possible Errors',
      recommended: false
    },
    schema: [{
      type: 'object',
      properties: {
        prefixType: {
          type: 'string'
        }
      },
      additionalProperties: false
    }]
  },

  create: function(context) {
    let config = context.options[0] || {};
    var prefixType = config.prefixType || 'dash'; // camelCase | dash | underscore (look at transform above)

    let exportDefaultDeclaration_name = '';
    let classDeclaration_name = '';
    let jsxElements_with_className = [];

    let clear = () => {
	exportDefaultDeclaration_name = '';
	classDeclaration_name = '';
	jsxElements_with_className = [];
    }
    
    let validate = (node, context) => {
        if (jsxElements_with_className.length < 1) return;

	let prefix = exportDefaultDeclaration_name || classDeclaration_name;
	if (prefix) {
		let t = transform[prefixType] || function(str){return str}
		prefix = t(prefix) + '__';
	} else {
		context.report({
			node: node,
			message: 'Cannot find class prefix (no default export and no class definition)'
		});
	}

	jsxElements_with_className.forEach(node => {
		node.openingElement.attributes.forEach( attr =>{
			if (attr.name && attr.name.name === 'className') {
				if (attr.value && attr.value.type === 'Literal') {
					const classes = (attr.value.value || '').split(' ');
					classes.forEach(cx => {
						if (cx.indexOf(prefix) != 0 && cx !== prefix.replace('__', '')) {
							context.report({
								node: node,
								message: 'Class "'+cx+'" name should starts with "' + prefix + '"'
							});
						}
					})
				}
			}
		})
	});
	clear();
    }

    return {
    
      'Program:exit': function(node) {
		validate(node, context);
      },

      ExportDefaultDeclaration: function(node) {
		//name = node.declaration.name | node.declaration.id.name
		if (!exportDefaultDeclaration_name) {
			const {declaration} = node;
			const {name} = declaration || {};
			exportDefaultDeclaration_name = name;
			if (!exportDefaultDeclaration_name) {
				const {id} = declaration || {};
				const {name} = declaration || {};
				exportDefaultDeclaration_name = name;
			}
		}
      },
      
      ClassDeclaration : function(node) {
		//name = node.id.name
		if (!classDeclaration_name) {
			const {id} = node;
			const {name} = id || {};
			classDeclaration_name = name;
		}
      },

      JSXElement: function(node) {
		let className_found = false;
		node.openingElement.attributes.forEach(attr=>{
			if (attr.name && attr.name.name === 'className') className_found = true;
		})
		if (className_found) {
			jsxElements_with_className.push(node);
		}
        }
      }

  }
};
