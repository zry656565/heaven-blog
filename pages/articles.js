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
    if ($J.currentLabel === 'null') {
        $J.currentLabel = null;
    }

    function simpleClone(obj) {
        return JSON.parse(JSON.stringify(obj));
    }

    /* define Components...
     =====================================*/

    var LabelList = React.createClass({
        getInitialState: function() {
            return {
                labels: simpleClone($J.labels)
            };
        },
        handleClick: function(i, app, e) {
            e.preventDefault();
            var nextSelected = this.state.labels[i].name;
            app.setState({
                selected: nextSelected
            });
            window.history.replaceState({}, '', $J.baseUrl + nextSelected);
        },
        render: function() {
            var list = this,
                selected = this.props.selected,
                createLabel = function(label, i) {
                    if (label.name === selected) {
                        return <span onClick={list.handleClick.bind(list, i, list.props.app)} className="post-label select" key={i}>{label.name}</span>;
                    }
                    return <span onClick={list.handleClick.bind(list, i, list.props.app)} className="post-label" key={i}>{label.name}</span>;
                };

            return (
                <section className="label-section">
                    <h2>标签列表</h2>
                    <hr/>
                    <div>{this.state.labels.map(createLabel)}</div>
                </section>
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
        getInitialState: function() {
            return {
                posts: simpleClone($J.posts)
            };
        },
        render: function() {
            var previousDate = '9999-99-99',
                selected = this.props.selected,
                createPost = function(post) {
                    if (selected === "显示全部" || post.labels.indexOf(selected) >= 0) {
                        var postDOM = [];
                        if (post.date.substr(0,7) < previousDate.substr(0,7)) {
                            postDOM.push(<MonthHeader date={post.date} />);
                            previousDate = post.date;
                        }
                        postDOM.push(<Post post={post} />);
                        return postDOM;
                    }
                };

            return (
                <section className="articles-section">
                    <h2>文章列表</h2>
                    <hr/>
                    <ul className="articles">{this.state.posts.map(createPost)}</ul>
                </section>
            );
        }
    });

    var ArticlesApp = React.createClass({
        getInitialState: function() {
            return {
                selected: $J.currentLabel || '显示全部'
            };
        },
        render: function() {
            return (
                <div>
                    <LabelList app={this} selected={this.state.selected}/>
                    <PostList selected={this.state.selected}/>
                </div>
            );
        }
    });

    /* Rendering begin...
     =====================================*/

    React.render(<ArticlesApp />, document.getElementById('main'));

}(jQuery));