import React from 'react';
import Component from 'components/Component';
import Select from 'components/controls/Select';
import {getMonthlyOptions, getQuarterOptions} from 'components/utils/objective';


export default class StartBySelect extends Component {

	render() {
		const { recurrentType, quarter, quarterSelect, month, monthSelect, customYear } = this.props;
		if (!recurrentType || (recurrentType !== 'quarterly' && recurrentType !== 'monthly')) return null;

		const options = recurrentType === 'quarterly' ? getQuarterOptions(customYear) : getMonthlyOptions(customYear);
		const selectedValue = recurrentType === 'quarterly' ? quarter : month;
		return (
			<Select
				selected={selectedValue}
				select={{
					options,
				}}
				onChange={(e) => { recurrentType === 'quarterly' ? quarterSelect(e) : monthSelect(e) }}
				style={{width: 180, marginLeft: 'auto', paddingTop: 5}}
			/>
		)
	}
}
