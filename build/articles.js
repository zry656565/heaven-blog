(function($) {
    /* prepare for the data
     =====================================*/
    var i, tags = {
        "显示全部": 999999
    };
    for (i = 0; i < $J.labels.length; i++) {
        var t = tags[$J.labels[i]];
        tags[$J.labels[i]] = t ? t+1 : 1;
    }

    $J.labels = [];
    for (var tag in tags) {
        $J.labels.push({
            name: tag,
            value: tags[tag]
        });
    }
    $J.labels.sort(function(a, b){
        return b.value - a.value;
    });

    // usage: get param from url
    $.urlParam = function(name){
        var results = new RegExp('[\?&]' + name + '=([^&#]*)').exec(window.location.href);
        if (results==null){
            return null;
        } else{
            return results[1] || 0;
        }
    };
    $J.currentLabel = decodeURI($.urlParam("label"));

    /* define Components...
     =====================================*/

    var Label = React.createClass({displayName: "Label",
        //getInitialState: function() {
        //    return {selected: false};
        //},
        //handleClick: function(event) {
        //    this.state.selected = true;
        //    React.render(<LabelList labels={$J.labels} />, document.getElementById('label-list'));
        //},
        render: function() {
            var selected = '',
                name = this.props.label.name;
            if (name === $J.currentLabel) {
                selected = 'select';
            }
            return (
                //<span onClick={this.handleClick} className={"post-label " + selected}>{name}</span>
                React.createElement("a", {href: $J.baseUrl + name}, React.createElement("span", {className: "post-label " + selected}, name))
            );
        }
    });

    var LabelList = React.createClass({displayName: "LabelList",
        render: function() {
            var rows = [];
            this.props.labels.forEach(function(label) {
                rows.push(React.createElement(Label, {label: label}));
            });
            return (
                React.createElement("div", null, rows)
            );
        }
    });

    var Post = React.createClass({displayName: "Post",
        render: function() {
            var post = this.props.post;
            return (
                React.createElement("li", {className: "article"}, 
                    React.createElement("span", {className: "article-date"}, post.date), 
                    React.createElement("a", {className: "article-title", href: post.link}, post.title)
                )
            );
        }
    });

    var MonthHeader = React.createClass({displayName: "MonthHeader",
        render: function() {
            var year = this.props.date.substr(0,4),
                month = this.props.date.substr(5,2);
            return (React.createElement("li", null, React.createElement("h3", null, year, "年", month, "月")));
        }
    });

    var PostList = React.createClass({displayName: "PostList",
        render: function() {
            var rows = [];
            var previousDate = '9999-99-99';
            this.props.posts.forEach(function(post) {
                if ($J.currentLabel === "null" || $J.currentLabel === "显示全部" || post.labels.indexOf($J.currentLabel) >= 0) {
                    if (post.date.substr(0,7) < previousDate.substr(0,7)) {
                        rows.push(React.createElement(MonthHeader, {date: post.date}));
                        previousDate = post.date;
                    }
                    rows.push(React.createElement(Post, {post: post}));
                }
            });
            return (
                React.createElement("ul", {className: "articles"}, rows)
            );
        }
    });

    /* Rendering begin...
     =====================================*/

    React.render(React.createElement(LabelList, {labels: $J.labels}), document.getElementById('label-list'));
    React.render(React.createElement(PostList, {posts: $J.posts}), document.getElementById('articles-list'));

}(jQuery));