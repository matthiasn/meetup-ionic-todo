angular.module('todo', ['ionic'])

.factory('Projects', function($window) {
    return {
        all: function() {
            var projectString = $window.localStorage['projects'];
            if(projectString) {
                return angular.fromJson(projectString)
            }
            return [];
        },
        save: function(projects) {
            $window.localStorage['projects'] = angular.toJson(projects);
        },
        newProject: function(projectTitle) {
          // Add a new project
          return {
            title: projectTitle,
            tasks: []
          };
        },
        getLastActiveIndex: function() {
          return parseInt($window.localStorage['lastActiveProject']) || 0;
        },
        setLastActiveIndex: function(index) {
          $window.localStorage['lastActiveProject'] = index;
        }
    }
})

.controller('TodoCtrl', function($rootScope, $timeout, $ionicModal, Projects, $ionicSideMenuDelegate) {
    var ctrl = this;
    
    // A utility function for creating a new project
    // with the given projectTitle
    var createProject = function(projectTitle) {
      var newProject = Projects.newProject(projectTitle);
      ctrl.projects.push(newProject);
      Projects.save(ctrl.projects);
      ctrl.selectProject(selectProject, ctrl.projects.length-1);
    }
    
    // Load or initialize projects
    ctrl.projects = Projects.all();
    
    // Called to create a new project
    ctrl.newProject = function() {
      var projectTitle = prompt('Project name');
      if(projectTitle) {
        createProject(projectTitle);
      }
    };
    
    // Called to select the given project
    ctrl.selectProject = function(project, index) {
      ctrl.activeProject = project;
      Projects.setLastActiveIndex(index);
      $ionicSideMenuDelegate.toggleLeft(false);
    };
    
    scope = $rootScope.$new()
    
    
    scope.createTask = function(task) {
      if(!ctrl.activeProject || !task) {
        return;
      }
      ctrl.activeProject.tasks.push({
        title: task.title
      });
      ctrl.taskModal.hide();

      // Inefficient, but save all the projects
      Projects.save(ctrl.projects);

      task.title = "";
    };
    
    ctrl.newTask = function() {
        ctrl.taskModal.show();
    }
    
    scope.closeNewTask = function() {
        ctrl.taskModal.hide();
    }

        
    $ionicModal.fromTemplateUrl('new-task.html', function(modal){
        ctrl.taskModal = modal;
    }, {
        scope: scope,
        animation: 'slide-in-right'
    });

    ctrl.toggleProjects = function() {
      $ionicSideMenuDelegate.toggleLeft();
    };
    
    // Try to create the first project, make sure to defer
    // this by using $timeout so everything is initialized
    // properly
    $timeout(function() {
      if(ctrl.projects.length == 0) {
        while(true) {
          var projectTitle = prompt('Your first project title:');
          if(projectTitle) {
            createProject(projectTitle);
            break;
          }
        }
      }
    });
})
