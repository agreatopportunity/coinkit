package currency

import (
	"testing"
)

func TestMakeTestSendOperation(t *testing.T) {
	st := makeTestSendOperation(0)
	if !st.Verify() {
		t.Fatal("should verify")
	}
}
