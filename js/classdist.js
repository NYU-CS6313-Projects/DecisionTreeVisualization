
setTimeout(function () {
    console.log(total_Real_Positive)
    var chart = c3.generate({
        data:{
            x :'x',
            columns: [
            ['x', 'True Data', 'Predicted Data'],
            ['Positive (Diabetes)', total_Real_Positive, total_Predict_Positive], 
            ['Negative', total_Real_Negative, total_Predict_Negative],
            ],
            groups:[
               ['Negative', 'Positive (Diabetes)']
               ],
            type: 'bar',
            colors: {
            'Positive (Diabetes)': '#7D0C0C',
            'Negative': '#1f77b4'
        }, 
        },
        axis : {
            x : {
                type: 'categorized'
            },
            y : {
                tick: {
                        count: 5
                    }
            }
        }
        });
}, 2000);



