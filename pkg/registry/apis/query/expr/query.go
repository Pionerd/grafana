package expr

import (
	"github.com/grafana/grafana/pkg/expr"
	"github.com/grafana/grafana/pkg/expr/classic"
)

// Supported expression types
// +enum
type QueryType string

const (
	// Apply a mathematical expression to results
	QueryTypeMath QueryType = "math"

	// Reduce query results
	QueryTypeReduce QueryType = "reduce"

	// Resample query results
	QueryTypeResample QueryType = "resample"

	// Classic query
	QueryTypeClassic QueryType = "classic"

	// Threshold
	QueryTypeThreshold QueryType = "threshold"
)

type MathQuery struct {
	// General math expression
	Expression string `json:"expression" jsonschema:"minLength=1,example=$A + 1,example=$A/$B"`
}

type ReduceQuery struct {
	// Reference to single query result
	Expression string `json:"expression" jsonschema:"minLength=1,example=$A"`

	// The reducer
	Reducer ReducerID `json:"reducer"`

	// Reducer Options
	Settings *ReduceSettings `json:"settings,omitempty"`
}

// QueryType = resample
type ResampleQuery struct {
	// The math expression
	Expression string `json:"expression" jsonschema:"minLength=1,example=$A + 1,example=$A"`

	// The time durration
	Window string `json:"window" jsonschema:"minLength=1,example=1w,example=10m"`

	// The downsample function
	Downsampler string `json:"downsampler"`

	// The upsample function
	Upsampler string `json:"upsampler"`
}

type ThresholdQuery struct {
	// Reference to single query result
	Expression string `json:"expression" jsonschema:"minLength=1,example=$A"`

	// Threshold Conditions
	Conditions []expr.ThresholdConditionJSON `json:"conditions"`
}

type ClassicQuery struct {
	Conditions []classic.ConditionJSON `json:"conditions"`
}

//-------------------------------
// Non-query commands
//-------------------------------

type ReduceSettings struct {
	// Non-number reduce behavior
	Mode ReduceMode `json:"mode"`

	// Only valid when mode is replace
	ReplaceWithValue *float64 `json:"replaceWithValue,omitempty"`
}

// The reducer function
// +enum
type ReducerID string

const (
	ReducerSum   ReducerID = "sum"
	ReducerMean  ReducerID = "mean"
	ReducerMin   ReducerID = "min"
	ReducerMax   ReducerID = "max"
	ReducerCount ReducerID = "count"
	ReducerLast  ReducerID = "last"
)

// Non-Number behavior mode
// +enum
type ReduceMode string

const (
	// Drop non-numbers
	ReduceModeDrop ReduceMode = "dropNN"

	// Replace non-numbers
	ReduceModeReplace ReduceMode = "replaceNN"
)
