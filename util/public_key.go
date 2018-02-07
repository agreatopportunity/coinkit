package util

import (
	"bytes"
	"encoding/hex"
	"errors"

	"golang.org/x/crypto/sha3"
)

// The last two bytes are a checksum.
type PublicKey [34]byte

// Calculate a checksum for a byte array
func checkBytes(input []byte) []byte {
	if len(input) != 32 {
		panic("checkBytes called on bad-length input")
	}
	h := sha3.New512()
	h.Write(input)
	return h.Sum(nil)[:2]
}

// GeneratePublicKey adds a checksum on the end.
func GeneratePublicKey(input []byte) PublicKey {
	if len(input) != 32 {
		panic("caller should only generate public keys with 32 bytes")
	}
	var answer PublicKey
	copy(answer[:], input)
	copy(answer[32:], checkBytes(input))
	return answer
}

func (pk PublicKey) Validate() bool {
	return bytes.Equal(checkBytes(pk[:32]), pk[32:])
}

func (pk PublicKey) String() string {
	return "0x" + hex.EncodeToString(pk[:])
}

func (pk PublicKey) Equal(other PublicKey) bool {
	return bytes.Equal(pk[:], other[:])
}

// ReadPublicKey attempts to read a public key from a string format.
// The string format starts with "0x" and is hex-encoded.
// If the input format is not valid.
func ReadPublicKey(input string) (PublicKey, error) {
	var invalid PublicKey
	if len(input) != 70 {
		return invalid, errors.New("public key strings are 70 characters long")
	}
	if input[:2] != "0x" {
		return invalid, errors.New("public key strings should start with 0x")
	}
	bs, err := hex.DecodeString(input[2:])
	if err != nil {
		return invalid, err
	}
	var answer PublicKey
	copy(answer[:], bs)
	if !answer.Validate() {
		return invalid, errors.New("bad checksum")
	}
	return answer, nil
}
