var model = function (table, fields) {

  var Model = function (db, data) {

    this.db = db;
    this.id = null;
    this.setData(data);

  };

  Model.table = table;
  Model.fields = ['id'].concat(fields);

  Model.count = function (db, conditions, callback) {

    var sql = 'select count(*) as count from ' + table,
        data = [];

    if (conditions) {
      var where = [];
      for (var field in conditions) {
        if (conditions.hasOwnProperty(field)) {
          where.push(' ' + field + ' = ?');
          data.push(conditions[field]);
        }
      }
      if (where.length > 0) {
        sql += ' where ' + where.join(', ');
      }
    }

    var args = [sql];
    if (data.length > 0) {
      args.push(data);
    }
    args.push(function (err, rows, fields) {

      if (err) throw err;

      if (rows.length > 0 && callback && typeof callback === 'function') {
        callback(rows[0].count);
      }

    });
    db.query.apply(db, args);

  };

  Model.prototype = {

    constructor: Model,

    fields: function () {

      return ['id'].concat(fields);

    },

    isField: function (field) {

      return field === 'id' || fields.indexOf(field) >= 0;

    },

    setData: function (data) {

      for (var field in data) {
        if (data.hasOwnProperty(field) && this.isField(field)) {
          this[field] = data[field];
        }
      }

    },

    data: function (withoutId) {

      var i, l, data = withoutId ? {} : {id: this.id};
      for (i = 0, l = fields.length; i < l; i++) {
        data[fields[i]] = this[fields[i]];
      }
      return data;

    },

    dataWithoutId: function () {

      return this.data(true);

    },

    get: function (callback) {

      var sql = 'select ' + this.fields().join(', ') + ' from ' + table + ' where id = ? limit 1',
          data = this.id;

      this.db.query(sql, data, (function (model) {

        return function (err, rows, fields) {

          if (err) throw err;

          if (rows.length > 0) {
            model.setData(rows[0]);
          }

          if (callback && typeof callback === 'function') {
            callback(model);
          }

        };

      })(this));

    },

    isSaved: function () {

      return this.id && this.id > 0;

    },

    save: function (callback) {

      var sql, data = [this.dataWithoutId()];
      if (this.isSaved()) {
        sql = 'update ' + table + ' set ? where id = ?';
        data.push(this.id);
      } else {
        sql = 'insert into ' + table + ' set ?';
      }
      this.db.query(sql, data, (function (model) {

        return function (err, result) {

          if (err) throw err;

          if (!model.isSaved()) {
            model.id = result.insertId;
          }

          if (callback && typeof callback === 'function') {
            callback(model);
          }

        };

      })(this));

    },

    remove: function (callback) {

      var sql = 'delete from ' + table + ' where id = ? limit 1',
          data = this.id;
      this.db.query(sql, data, (function (model) {

        return function (err, result) {

          if (err) throw err;

          if (callback && typeof callback === 'function') {
            callback(result.affectedRows > 0);
          }

        };

      })(this));

    }

  };

  return Model;

};

model.oneToMany = function (parentModel, childModel, parentName, childrenName, childModelField) {

  if (!childModelField) {
    childModelField = parentName + '_id';
  }

  childModel.prototype[parentName] = function (callback) {

    var p = new parentModel(this.db, {id: this[childModelField]});
    p.get(callback);
    return p;

  };

  parentModel.prototype[childrenName] = function (callback) {

    var sql = 'select ' + childModel.fields.join(', ') + ' from ' + childModel.table + ' where ' + childModelField + ' = ?',
        data = this.id;

    this.db.query(sql, data, (function (p) {

      return function (err, rows, fields) {

        if (err) throw err;

        var i, l, children = [];
        for (i = 0, l = rows.length; i < l; i++) {
          children.push(new childModel(p.db, rows[i]));
        }

        if (callback && typeof callback === 'function') {
          callback(children);
        }

      };

    })(this));

  };

};

module.exports = model;
