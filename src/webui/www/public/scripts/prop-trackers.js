var trackersDynTable = new Class({

    initialize: function() {},

    setup: function(table) {
        this.table = $(table);
        this.rows = new Hash();
    },

    removeRow: function(url) {
        if (this.rows.has(url)) {
            var tr = this.rows.get(url);
            tr.dispose();
            this.rows.erase(url);
            return true;
        }
        return false;
    },

    removeAllRows: function() {
        this.rows.each(function(tr, url) {
            this.removeRow(url);
        }.bind(this));
    },

    updateRow: function(tr, row) {
        var tds = tr.getElements('td');
        for (var i = 0; i < row.length; i++) {
            tds[i].set('html', row[i]);
        }
        return true;
    },

    insertRow: function(row) {
        var url = row[0];
        if (this.rows.has(url)) {
            var tr = this.rows.get(url);
            this.updateRow(tr, row);
            return;
        }
        //this.removeRow(id);
        var tr = new Element('tr');
        this.rows.set(url, tr);
        for (var i = 0; i < row.length; i++) {
            var td = new Element('td');
            td.set('html', row[i]);
            td.injectInside(tr);
        }
        tr.injectInside(this.table);
    },
});

var current_hash = "";

var loadTrackersDataTimer;
var loadTrackersData = function() {
    if ($('prop_trackers').hasClass('invisible')) {
        // Tab changed, don't do anything
        return;
    }
    var new_hash = myTable.getCurrentTorrentHash();
    if (new_hash == "") {
        tTable.removeAllRows();
        loadTrackersDataTimer = loadTrackersData.delay(1500);
        return;
    }
    if (new_hash != current_hash) {
        tTable.removeAllRows();
        current_hash = new_hash;
    }
    var url = 'json/propertiesTrackers/' + current_hash;
    var request = new Request.JSON({
        url: url,
        noCache: true,
        method: 'get',
        onFailure: function() {
            $('error_div').set('html', '_(qBittorrent client is not reachable)');
            loadTrackersDataTimer = loadTrackersData.delay(2000);
        },
        onSuccess: function(trackers) {
            $('error_div').set('html', '');
            if (trackers) {
                // Update Trackers data
                trackers.each(function(tracker) {
                    var row = new Array();
                    row.length = 4;
                    row[0] = tracker.url;
                    row[1] = tracker.status;
                    row[2] = tracker.num_peers;
                    row[3] = tracker.msg;
                    tTable.insertRow(row);
                });
            }
            else {
                tTable.removeAllRows();
            }
            loadTrackersDataTimer = loadTrackersData.delay(1500);
        }
    }).send();
}

var updateTrackersData = function() {
    clearTimeout(loadTrackersDataTimer);
    loadTrackersData();
}

tTable = new trackersDynTable();
tTable.setup($('trackersTable'));

// Add trackers code
$('addTrackersPlus').addEvent('click', function addTrackerDlg() {
    if (current_hash.length == 0) return;
    new MochaUI.Window({
        id: 'trackersPage',
        title: "_(Trackers addition dialog)",
        loadMethod: 'iframe',
        contentURL: 'addtrackers.html?hash=' + current_hash,
        scrollbars: true,
        resizable: false,
        maximizable: false,
        closable: true,
        paddingVertical: 0,
        paddingHorizontal: 0,
        width: 500,
        height: 250
    });
});