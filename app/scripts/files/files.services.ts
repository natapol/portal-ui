module ngApp.files.services {
  import IFiles = ngApp.files.models.IFiles;
  import ICoreService = ngApp.core.services.ICoreService;
  import IFile = ngApp.files.models.IFile;
  import ILocationService = ngApp.components.location.services.ILocationService;
  import IUserService = ngApp.components.user.services.IUserService;
  import IRootScope = ngApp.IRootScope;

  export interface IFilesService {
    getFile(id: string, params: Object): ng.IPromise<IFile>;
    getFiles(params?: Object): ng.IPromise<IFiles>;
  }

  class FilesService implements IFilesService {
    private ds: restangular.IElement;

    /* @ngInject */
    constructor(Restangular: restangular.IService, private LocationService: ILocationService,
                private UserService: IUserService, private CoreService: ICoreService,
                private $rootScope: IRootScope, private $q: ng.IQService, private $filter, private $window) {
      this.ds = Restangular.all("files");
    }

    getFile(id: string, params: Object = {}): ng.IPromise<IFile> {
      if (params.hasOwnProperty("fields")) {
        params["fields"] = params["fields"].join();
      }

      return this.ds.get(id, params).then((response): IFile => {
        return response["data"];
      });
    }
  
    downloadFiles(_ids) {
        var $filter = this.$filter;
        var $window = this.$window;
        var x = $filter('makeDownloadLink')(_ids);  
        $window.location = x;
    
    }

    getFiles(params: Object = {}): ng.IPromise<IFiles> {
      if (params.hasOwnProperty("fields")) {
        params["fields"] = params["fields"].join();
      }

      if (params.hasOwnProperty("facets")) {
        params["facets"] = params["facets"].join();
      }

      var paging = angular.fromJson(this.LocationService.pagination()["files"]);

      // Testing is expecting these values in URL, so this is needed.
      paging = paging || {
        size: 10,
        from: 1
      };

      var defaults = {
        size: paging.size,
        from: paging.from,
        sort: paging.sort || "file_name:asc",
        filters: this.LocationService.filters()
      };


      defaults.filters = this.UserService.addMyProjectsFilter(defaults.filters, "participants.project.project_id");
      this.CoreService.setSearchModelState(false);

      var abort = this.$q.defer();
      var prom: ng.IPromise<IFiles> = this.ds.withHttpConfig({
        timeout: abort.promise
      })
      .get("", angular.extend(defaults, params)).then((response): IFiles => {
        this.CoreService.setSearchModelState(true);
        return response["data"];
      });

      var eventCancel = this.$rootScope.$on("gdc-cancel-request", () => {
        abort.resolve();
        eventCancel();
        this.CoreService.setSearchModelState(true);
      });

      return prom;
    }
  }

  angular
      .module("files.services", ["restangular", "components.location", "user.services", "core.services","ui.bootstrap"])
      .directive('downloadButton',function(){
        return {
          restrict:"AE",
          scope:{
            files:'='
          },
          controller:function($element,$scope, FilesService,UserService,$modal){
              $element.on('click',function(a){
                var files = $scope.files;
                if (!_.isArray(files)) files = [files];
                if (UserService.userCanDownloadFiles(files)){
                  FilesService.downloadFiles(files.map(function(a){return a.file_id}));
                } else {
                  var template = UserService.currentUser ? 
                      "core/templates/request-access-to-download-single.html" : 
                      "core/templates/login-to-download-single.html";
                    console.log("File not authorized.");
                    $modal.open({
                      templateUrl: template,
                      controller: "LoginToDownloadController as wc",
                      backdrop: "static",
                      keyboard: false,
                      scope: $scope,
                      backdropClass: "warning-backdrop",
                      size: "lg"
                    });
                }
            })
          }
        }
      })
      .service("FilesService", FilesService);
}

