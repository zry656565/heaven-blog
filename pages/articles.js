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

    var Label = React.createClass({
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
                <a href={$J.baseUrl + name}><span className={"post-label " + selected}>{name}</span></a>
            );
        }
    });

    var LabelList = React.createClass({
        render: function() {
            var rows = [];
            this.props.labels.forEach(function(label) {
                rows.push(<Label label={label} />);
            });
            return (
                <div>{rows}</div>
            );
        }
    });

    var Post = React.createClass({
        render: function() {
            var post = this.props.post;
            return (
                <li className="article">
                    <span className="article-date">{post.date}</span>
                    <a className="article-title" href={post.link}>{post.title}</a>
                </li>
            );
        }
    });

    var MonthHeader = React.createClass({
        render: function() {
            var year = this.props.date.substr(0,4),
                month = this.props.date.substr(5,2);
            return (<li><h3>{year}年{month}月</h3></li>);
        }
    });

    var PostList = React.createClass({
        render: function() {
            var rows = [];
            var previousDate = '9999-99-99';
            this.props.posts.forEach(function(post) {
                if ($J.currentLabel === "null" || $J.currentLabel === "显示全部" || post.labels.indexOf($J.currentLabel) >= 0) {
                    if (post.date.substr(0,7) < previousDate.substr(0,7)) {
                        rows.push(<MonthHeader date={post.date} />);
                        previousDate = post.date;
                    }
                    rows.push(<Post post={post} />);
                }
            });
            return (
                <ul className="articles">{rows}</ul>
            );
        }
    });

    /* Rendering begin...
     =====================================*/

    React.render(<LabelList labels={$J.labels} />, document.getElementById('label-list'));
    React.render(<PostList posts={$J.posts} />, document.getElementById('articles-list'));

}(jQuery));