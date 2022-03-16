Ext.define('Rally.technicalservices.Utilities',{
    singleton: true,
    fetchPortfolioTypes: function(){
        var deferred = Ext.create('Deft.Deferred');

        var typeStore = Ext.create('Rally.data.wsapi.Store', {
            autoLoad: false,
            model: 'TypeDefinition',
            sorters: [{
                property: 'Ordinal',
                direction: 'ASC'
            }],
            filters: [{
                property: 'Parent.Name',
                operator: '=',
                value: 'Portfolio Item'
            }, {
                property: 'Creatable',
                operator: '=',
                value: true
            }]
        });

        typeStore.load({
            scope: this,
            callback: function (records, operation, success) {
                if (success){
                    deferred.resolve(records);

                } else {
                    deferred.reject("Error loading Portfolio Item Types:  " + operation.error.errors.join(','));
                }
            }
        });
        return deferred;
    },
    fetchWsapiCount: function(model, query_filters){
        var deferred = Ext.create('Deft.Deferred');

        Ext.create('Rally.data.wsapi.Store',{
            model: model,
            fetch: ['ObjectID'],
            filters: query_filters,
            limit: 1,
            pageSize: 1
        }).load({
            callback: function(records, operation, success){
                if (success){
                    console.log('operation');
                    deferred.resolve(operation.resultSet.totalRecords);
                } else {
                    deferred.reject(Ext.String.format("Error getting {0} count for {1}: {2}", model, query_filters.toString(), operation.error.errors.join(',')));
                }
            }
        });
        return deferred;
    },
    fetchWsapiRecords: function(model, query_filters, fetch_fields, ignoreContext){
        var deferred = Ext.create('Deft.Deferred');

        var store = Ext.create('Rally.data.wsapi.Store',{
            model: model,
            fetch: fetch_fields,
            filters: query_filters,
            pageSize: 1000,
            limit: Infinity,
            enablePostGet: true,
            context: {project: null} //here becuase we are looking for milestone specific infomration and that can be in any project now
        }).load({
            callback: function(records, operation, success){
                if (success){
                    deferred.resolve(records);
                } else {
                    deferred.reject(Ext.String.format("Error getting {0} for {1}: {2}", model, query_filters.toString(), operation.error.errors.join(',')));
                }
            }
        });
        return deferred;
    },
    fetchScheduleStates: function(){
        var deferred = Ext.create('Deft.Deferred');
        Rally.data.ModelFactory.getModel({
            type: 'HierarchicalRequirement',
            success: function(model) {
                var field = model.getField('ScheduleState');
                field.getAllowedValueStore().load({
                    callback: function(records, operation, success) {
                        if (success){
                            var values = [];
                            for (var i=0; i < records.length ; i++){
                                values.push(records[i].get('StringValue'));
                            }
                            deferred.resolve(values);
                        } else {
                            deferred.reject('Error loading ScheduleState values for User Story:  ' + operation.error.errors.join(','));
                        }
                    },
                    scope: this
                });
            },
            failure: function() {
                var error = "Could not load schedule states";
                deferred.reject(error);
            }
        });
        return deferred.promise;
    },
    fetchAllowedValues: function(model, fieldName){
        var deferred = Ext.create('Deft.Deferred');

        model.getField(fieldName).getAllowedValueStore().load({
            callback: function(records, operation, success) {
                if (success){
                    var vals = _.map(records, function(r){ return r.get('StringValue').length === 0 ? "None" : r.get('StringValue'); });
                    deferred.resolve(vals);
                } else {
                    deferred.reject("Error fetching category data");
                }
            },
            scope: this
        });

        return deferred;
    }
});
