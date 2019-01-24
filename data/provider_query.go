package data

import (
	"fmt"
	"strings"
)

type ProviderQuery struct {
	ID    uint64 `json:"id"`
	Owner string `json:"owner"`
	Limit int    `json:"limit"`
}

func (q *ProviderQuery) String() string {
	parts := []string{}
	if q.ID != 0 {
		parts = append(parts, fmt.Sprintf("id=%d", q.ID))
	}
	if q.Owner != "" {
		parts = append(parts, fmt.Sprintf("owner=%s", q.Owner))
	}
	if len(parts) == 0 {
		return "<empty>"
	}
	return strings.Join(parts, " ")
}