var path = require("path");

var kanso_ver = "kanso.1";

if (typeof String.prototype.endsWith !== 'function') {
    String.prototype.endsWith = function(suffix) {
        return this.indexOf(suffix, this.length - suffix.length) !== -1;
    };
}

module.exports = function(grunt) {
  var kanso_config = grunt.file.readJSON(path.join('kanso', 'config.json'));
  var kansoTemplate = grunt.file.read('kanso/kanso.json');
  var kansoReadme = grunt.file.read('kanso/README.md');


  function TemplateData(file, deps) {
    return {
      name: path.basename(file, '.js'),
      ng_version: grunt.config.get('NG_VERSION').full,
      kanso_version: '<%= ng_version %>-'+kanso_config.version,
      file: "angular/<%= js_file %>",
      js_file: file,
      other_deps: deps
    };
  }

  function TemplateAndWrite(template, data, file) {
    var processed = grunt.template.process(template, {data: data});
    grunt.file.write(file, processed);
  }

  grunt.registerTask('kanso:prepare', 'prepare all the kanso packages', function() {
    var files = grunt.file.expand("build/angular-*.js");
    for(var i=0; i < files.length; i++) {
      var file = files[i];
      var lib = path.basename(file, ".js");
      var kansoFolder = path.join("kanso",lib);
      var js_file = path.basename(file);

      grunt.file.copy(file, path.join(kansoFolder, "angular", js_file));

      var data;
      if(js_file === 'angular.js')
        data = TemplateData(js_file);
      else if (js_file == 'angular-bootstrap-prettify.js')
        data = TemplateData(js_file, 
          ",\n    \"angular\":\"=<%= kanso_version %>\"" +
          ",\n    \"angular-resource\":\"=<%= kanso_version %>\"" +
          ",\n    \"angular-sanitize\":\"=<%= kanso_version %>\"" +
          ",\n    \"angular-cookies\":\"=<%= kanso_version %>\"");
      else
        data = TemplateData(js_file, 
          ",\n    \"angular\":\"<%= kanso_version %>\"");
      
      TemplateAndWrite(kansoTemplate, data,
        path.join(kansoFolder, 'kanso.json'));
      TemplateAndWrite(kansoReadme, data,
        path.join(kansoFolder, 'README.md'));

      grunt.log.ok("Library " + js_file);
    }
  });

  grunt.registerTask('kanso:clean', 'clean all the kanso packages', function() {
    var kanso_data = grunt.file.expand("kanso/angular*");
    for(var i in kanso_data) {
      var file = kanso_data[i];
      if(grunt.file.isDir(file) || file.endsWith(".tar.gz")) {
        grunt.file.delete(file);
        grunt.log.ok("Deleted " +file + " ")
      }
    }
  });

   grunt.registerTask('kanso', 'build kanso packages', ['clean', 'buildall', 'kanso:prepare']);
};