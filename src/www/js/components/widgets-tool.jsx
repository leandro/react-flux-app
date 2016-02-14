"use strict";

const
	objectAssign = require("object-assign"),
	Immutable = require("immutable"),
	React = require("react"),
	WidgetsTable = require("./widgets-table"),
	WidgetView = require("./widget-view"),
	WidgetEdit = require("./widget-edit"),
	widgetsData = require("../widgets-data");

module.exports = class WidgetsTool extends React.Component {

	constructor(props) {
		super(props);

		this.state = {
			currentAction: props.action || "table",
			currentWidgetId: -1,
			lastWidgetId: widgetsData.length,
			widgets: new Immutable.List(widgetsData)
		};

		this._onEditWidget = this._onEditWidget.bind(this);
		this._onViewWidget = this._onViewWidget.bind(this);
		this._onTableOfWidgets = this._onTableOfWidgets.bind(this);
		this._onSaveWidget = this._onSaveWidget.bind(this);
		this._onDeleteWidget = this._onDeleteWidget.bind(this);
	}

	_prepareState(action, widgetId) {
		return function(previousState, currentProps) {
			return {
				currentAction: action,
				currentWidgetId: widgetId
			};
		};
	}

	_onEditWidget(widgetId) {
		this.setState(this._prepareState("edit", widgetId));
	}

	_onViewWidget(widgetId) {
		this.setState(this._prepareState("view", widgetId));
	}

	_onTableOfWidgets() {
		this.setState(this._prepareState("table"));
	}

	_onSaveWidget(newWidget, nextAction) {

		let widgets = null;

		if (newWidget.id) {

			let
				widget = this._getWidget(newWidget.id),
				widgetIndex = this._getWidgetIndex(this._getWidget(newWidget.id));

			widget = objectAssign({}, widget, newWidget);
			widgets = this.state.widgets.set(widgetIndex, widget);

		} else {
			widgets = this.state.widgets.push(objectAssign({}, newWidget, { id: ++this.state.lastWidgetId }));
		}

		this.setState({
			widgets: widgets,
			currentAction: nextAction || "table",
			lastWidgetId: this.state.lastWidgetId
		});
	}

	_onDeleteWidget(widgetId, nextAction) {

		let widgetIndex = this._getWidgetIndex(this._getWidget(widgetId));

		this.setState({
			widgets: this.state.widgets.delete(widgetIndex),
			currentAction: nextAction || "table"
		});
	}

	_getWidget(widgetId) {
		return this.state.widgets.find(function(widget) {
			return widget.id === widgetId;
		}.bind(this));
	}

	_getWidgetIndex(widget) {
		return this.state.widgets.indexOf(widget);
	}

	_getView(action) {
		switch (action) {
			case "view":
				console.dir(this._getWidget(this.state.currentWidgetId));
				return <WidgetView widget={this._getWidget(this.state.currentWidgetId) || {}} editWidget={this._onEditWidget} returnToList={this._onTableOfWidgets} />;
			case "edit":
				return <WidgetEdit widget={this._getWidget(this.state.currentWidgetId)} saveWidget={this._onSaveWidget} deleteWidget={this._onDeleteWidget} returnToList={this._onTableOfWidgets} />;
			default:
				return <WidgetsTable widgets={this.state.widgets} editWidget={this._onEditWidget} viewWidget={this._onViewWidget} />;
		}
	}

	render() {
		return (<div>

			{this._getView(this.state.currentAction)}
		</div>);
	}

};
