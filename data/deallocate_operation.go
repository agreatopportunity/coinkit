package data

import (
	"fmt"

	"github.com/lacker/coinkit/util"
)

type DeallocateOperation struct {
	// Who is performing this deallocation. Can be either the bucket or provider owner
	Signer string `json:"signer"`

	// The sequence number for this operation
	Sequence uint32 `json:"sequence"`

	// The operation fee for entering an op into the blockchain
	Fee uint64 `json:"fee"`

	// The name of the bucket
	Name string `json:"name"`

	// The id of the provider
	ID uint64 `json:"id"`
}

func (op *DeallocateOperation) String() string {
	return fmt.Sprintf("Deallocate signer=%s, name=%s, id=%d",
		util.Shorten(op.Signer), op.Name, op.ID)
}

func (op *DeallocateOperation) OperationType() string {
	return "Deallocate"
}

func (op *DeallocateOperation) GetSigner() string {
	return op.Signer
}

func (op *DeallocateOperation) GetFee() uint64 {
	return op.Fee
}

func (op *DeallocateOperation) GetSequence() uint32 {
	return op.Sequence
}

func (op *DeallocateOperation) Verify() bool {
	if !IsValidBucketName(op.Name) {
		return false
	}
	if op.ID == 0 {
		return false
	}
	return true
}

func init() {
	RegisterOperationType(&DeallocateOperation{})
}